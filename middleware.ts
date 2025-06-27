import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  const path = req.nextUrl.pathname

  // Skip middleware for auth routes and public assets
  const skipPaths = [
    '/viewer/login',
    '/viewer/register',
    '/writer/login',
    '/writer/register',
    '/forgot-password',
    '/reset-password',
    '/waiting-list',
    '/api/',
    '/_next/',
    '/favicon.ico',
  ]

  if (skipPaths.some(p => path.startsWith(p))) {
    return res
  }

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/subscription', '/profile']
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))

  // Redirect to login if accessing protected route without auth
  if (!user && isProtectedPath) {
    const redirectTo = path.startsWith('/dashboard') ? '/writer/login' : '/viewer/login'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // For authenticated users accessing dashboard
  if (user && path.startsWith('/dashboard')) {
    // Check if user is a writer
    const isTokyoUnivEmail = user.email?.endsWith('@g.ecc.u-tokyo.ac.jp')
    
    if (!isTokyoUnivEmail) {
      // Not Tokyo Univ email, check writers table
      const { data: writer } = await supabase
        .from('writers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      
      if (!writer) {
        // Not a writer, redirect to articles
        return NextResponse.redirect(new URL('/articles', req.url))
      }
    }
    // User is authorized to access dashboard
  }

  // For authenticated users, check if they're accessing wrong area
  if (user && (path === '/subscription' || path === '/profile')) {
    // Check if user is a writer
    const isTokyoUnivEmail = user.email?.endsWith('@g.ecc.u-tokyo.ac.jp')
    const { data: writer } = await supabase
      .from('writers')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
    
    if (writer || isTokyoUnivEmail) {
      // Writer trying to access viewer pages
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)' 
  ],
}