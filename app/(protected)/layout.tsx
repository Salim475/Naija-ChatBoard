import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/app/(protected)/components/sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch real profile from DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single()

  const username = profile?.username || user.email?.split('@')[0] || 'Naija'
  const displayName = profile?.display_name || username

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
  
      <Sidebar
  username={profile?.username || username}
  displayName={profile?.display_name || username}
/>

      <main className="flex-1 min-h-screen md:ml-60 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}