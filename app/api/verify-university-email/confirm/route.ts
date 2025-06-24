import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'トークンが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // トークンで認証レコードを検索
    const { data: verification, error: verificationError } = await supabase
      .from('university_email_verifications')
      .select(`
        *,
        writers (
          id,
          auth_id,
          name
        )
      `)
      .eq('verification_token', token)
      .is('verified_at', null)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: '無効なトークンです' },
        { status: 400 }
      )
    }

    // 有効期限をチェック
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'トークンの有効期限が切れています' },
        { status: 400 }
      )
    }

    // メールアドレスのドメインから大学を取得
    const emailDomain = verification.university_email.split('@')[1]
    const { data: university } = await supabase
      .from('universities')
      .select('name')
      .eq('email_domain', emailDomain)
      .single()

    // トランザクション的に更新
    const updates = await Promise.all([
      // 認証レコードを更新
      supabase
        .from('university_email_verifications')
        .update({
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id),
      
      // ライター情報を更新
      supabase
        .from('writers')
        .update({
          university_verified: true,
          verified_university: university?.name || emailDomain,
          verification_status: 'approved'
        })
        .eq('id', verification.writer_id)
    ])

    // エラーチェック
    for (const update of updates) {
      if (update.error) {
        console.error('Update error:', update.error)
        return NextResponse.json(
          { error: '更新処理に失敗しました' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: '大学メールアドレスの確認が完了しました',
      universityName: university?.name || emailDomain
    })

  } catch (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}