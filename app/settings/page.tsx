import { redirect } from 'next/navigation'

import { LogoutButton } from '@/features/auth/logout-button'
import { ProfileForm } from '@/features/profile/profile-form'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login?next=/settings')
  }

  const userId = data.claims.sub
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  return (
    <main className="mx-auto flex w-full max-w-120 flex-1 flex-col gap-6 px-4 py-10 text-sm">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
        <LogoutButton />
      </header>
      <p className="text-muted-foreground">{data.claims.email}</p>
      <ProfileForm userId={userId} initialDisplayName={profile?.display_name ?? ''} />
    </main>
  )
}
