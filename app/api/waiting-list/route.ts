import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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