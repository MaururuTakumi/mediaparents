import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { universityEmail } = await request.json()
    
    if (!universityEmail) {
      return NextResponse.json(
        { error: '大学メールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // メールアドレスのドメインをチェック
    const emailDomain = universityEmail.split('@')[1]
    
    const supabase = await createClient()
    
    // 大学マスターから該当する大学を検索
    const { data: university, error: universityError } = await supabase
      .from('universities')
      .select('*')
      .eq('email_domain', emailDomain)
      .eq('is_active', true)
      .single()

    if (universityError || !university) {
      return NextResponse.json(
        { error: '登録されていない大学のメールアドレスです' },
        { status: 400 }
      )
    }

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

    // 既存の未確認トークンを無効化
    await supabase
      .from('university_email_verifications')
      .delete()
      .eq('writer_id', writer.id)
      .is('verified_at', null)

    // 新しい認証トークンを生成
    const verificationToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24時間有効

    // 認証レコードを作成
    const { error: insertError } = await supabase
      .from('university_email_verifications')
      .insert({
        writer_id: writer.id,
        university_email: universityEmail,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('Verification record creation error:', insertError)
      return NextResponse.json(
        { error: '認証レコードの作成に失敗しました' },
        { status: 500 }
      )
    }

    // 確認メールを送信
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    
    const { error: emailError } = await resend.emails.send({
      from: 'ありがとうお父さんお母さん <noreply@todaimedia.com>',
      to: universityEmail,
      subject: '【ありがとうお父さんお母さん】大学メールアドレスの確認',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>大学メールアドレスの確認</h2>
          <p>こんにちは。</p>
          <p>ありがとうお父さんお母さんへのライター登録ありがとうございます。</p>
          <p>以下のボタンをクリックして、大学メールアドレスの確認を完了してください：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              メールアドレスを確認
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            このリンクは24時間有効です。<br>
            心当たりがない場合は、このメールを無視してください。
          </p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            ありがとうお父さんお母さん運営チーム
          </p>
        </div>
      `
    })

    if (emailError) {
      console.error('Email sending error:', emailError)
      return NextResponse.json(
        { error: 'メール送信に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '確認メールを送信しました',
      universityName: university.name
    })

  } catch (error) {
    console.error('University email verification error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}