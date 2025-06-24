import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 管理者ページへのアクセスをチェック
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('[Middleware] Admin route accessed:', request.nextUrl.pathname)
    
    const { data: { session } } = await supabase.auth.getSession()
    console.log('[Middleware] Session:', session?.user?.email, session?.user?.id)
    
    // 未ログインの場合はログインページへ
    if (!session) {
      console.log('[Middleware] No session, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // 管理者権限をチェック
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()
    
    console.log('[Middleware] Admin check:', { admin, error })
    
    // 管理者でない場合はホームへリダイレクト
    if (!admin || error) {
      console.log('[Middleware] Not an admin, redirecting to home')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('[Middleware] Admin access granted')
  }

  // ライター専用ページへのアクセスをチェック
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/writer/login', request.url))
    }
    
    // ライター情報の確認
    const { data: writer } = await supabase
      .from('writers')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()
    
    if (!writer) {
      return NextResponse.redirect(new URL('/writer/register', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*']  // 一時的に/adminを除外
}