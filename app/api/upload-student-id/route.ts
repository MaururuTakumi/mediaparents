import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPG、PNG、PDFファイルのみアップロード可能です' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ライター情報を取得
    const { data: writer, error: writerError } = await supabase
      .from('writers')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (writerError || !writer) {
      return NextResponse.json(
        { error: 'ライター情報が見つかりません' },
        { status: 404 }
      )
    }

    // 既存の未承認申請を削除
    const { data: existingVerification } = await supabase
      .from('student_id_verifications')
      .select('student_id_url')
      .eq('writer_id', writer.id)
      .eq('verification_status', 'pending')
      .single()

    if (existingVerification) {
      // 古いファイルを削除
      const oldPath = existingVerification.student_id_url.split('/').pop()
      if (oldPath) {
        await supabase.storage
          .from('student-ids')
          .remove([`${writer.id}/${oldPath}`])
      }
    }

    // ファイルをアップロード
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${writer.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('student-ids')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      )
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('student-ids')
      .getPublicUrl(filePath)

    // 認証レコードを作成または更新
    const { error: dbError } = await supabase
      .from('student_id_verifications')
      .upsert({
        writer_id: writer.id,
        student_id_url: publicUrl,
        verification_status: 'pending',
        uploaded_at: new Date().toISOString()
      }, {
        onConflict: 'writer_id'
      })

    if (dbError) {
      // エラーが発生したらアップロードしたファイルを削除
      await supabase.storage
        .from('student-ids')
        .remove([filePath])
      
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: '認証レコードの作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '学生証をアップロードしました。承認までお待ちください。',
      fileUrl: publicUrl
    })

  } catch (error) {
    console.error('Student ID upload error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}