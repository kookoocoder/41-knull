import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import AppClient from './AppClient'

export default async function AppPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }
  return <AppClient />
}
