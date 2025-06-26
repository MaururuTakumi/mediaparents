import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from "@/components/header";
import Footer from "@/components/footer";

export default async function ViewerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ライターかどうかチェック
  if (user) {
    const { data: writer } = await supabase
      .from('writers')
      .select('id')
      .eq('id', user.id)
      .single()

    const isTokyoUnivEmail = user.email?.endsWith('@g.ecc.u-tokyo.ac.jp')

    // ライターの場合、ライターダッシュボードへリダイレクト
    if (writer || isTokyoUnivEmail) {
      redirect('/dashboard')
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}