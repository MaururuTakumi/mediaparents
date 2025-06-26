import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if user is a writer
      const { data: writer } = await supabase
        .from('writers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      const isTokyoUnivEmail = user.email?.endsWith('@g.ecc.u-tokyo.ac.jp')
      
      // Redirect based on user type
      if (writer || isTokyoUnivEmail) {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}