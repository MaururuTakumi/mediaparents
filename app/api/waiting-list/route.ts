import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 早期登録特典の判定（2025年7月10日まで）
    const earlyBirdDeadline = new Date('2025-07-10T23:59:59+09:00')
    const now = new Date()
    const isEarlyBird = now < earlyBirdDeadline

    // メールアドレスを登録
    const { data, error } = await supabase
      .from('waiting_list')
      .insert([
        {
          email,
          early_bird: isEarlyBird,
          registered_at: now.toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      // 重複エラーの場合
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 400 }
        )
      }
      throw error
    }

    // 管理者への通知メールを送信
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'takumi2002929@icloud.com'
      
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: adminEmail,
        subject: '【ありがとうお父さんお母さん】新規登録通知',
        html: `
          <h2>ウェイティングリストに新規登録がありました</h2>
          <p><strong>メールアドレス:</strong> ${email}</p>
          <p><strong>登録日時:</strong> ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</p>
          <p><strong>早期登録特典:</strong> ${isEarlyBird ? '対象' : '対象外'}</p>
          ${isEarlyBird ? '<p style="color: #059669;">※7/10までの早期登録者です！</p>' : ''}
        `
      })
    } catch (emailError) {
      // メール送信エラーがあっても登録は成功扱い
      console.error('Admin notification email error:', emailError)
    }

    return NextResponse.json({
      success: true,
      early_bird: isEarlyBird,
      message: isEarlyBird 
        ? '早期登録特典が適用されました！' 
        : '登録が完了しました！'
    })

  } catch (error) {
    console.error('Waiting list registration error:', error)
    return NextResponse.json(
      { error: '登録中にエラーが発生しました' },
      { status: 500 }
    )
  }
}