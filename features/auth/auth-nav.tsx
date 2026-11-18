import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/features/auth/logout-button'
import { createClient } from '@/lib/supabase/server'

export async function AuthNav() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    return (
      <Button variant="outline" size="sm" render={<Link href="/auth/login" />}>
        로그인
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" render={<Link href="/settings" />}>
        설정
      </Button>
      <LogoutButton />
    </div>
  )
}
