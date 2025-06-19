import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreatorHeader from '@/components/creator-header'

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is a writer (updated to use auth_id)
  const { data: writer } = await supabase
    .from('writers')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!writer) {
    redirect('/register')
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