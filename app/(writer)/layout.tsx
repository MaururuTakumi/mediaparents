import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreatorHeader from '@/components/creator-header'

export default async function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/writer/login')
  }

  // Check if user is a writer
  const { data: writer } = await supabase
    .from('writers')
    .select('*')
    .eq('id', user.id)
    .single()

  // Also check if user has Tokyo University email
  const isTokyoUnivEmail = user.email?.endsWith('@g.ecc.u-tokyo.ac.jp')

  if (!writer && !isTokyoUnivEmail) {
    // Not a writer, redirect to viewer pages
    redirect('/articles')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CreatorHeader writer={writer} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}