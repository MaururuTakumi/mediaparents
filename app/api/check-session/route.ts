import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  try {
    // セッション情報を取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // 管理者情報を取得（ユーザーが存在する場合）
    let adminInfo = null
    let adminError = null
    
    if (user) {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      adminInfo = data
      adminError = error
    }
    
    return NextResponse.json({
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email
        },
        expires_at: session.expires_at
      } : null,
      user: user ? {
        id: user.id,
        email: user.email
      } : null,
      admin: adminInfo,
      errors: {
        session: sessionError?.message,
        user: userError?.message,
        admin: adminError?.message
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}