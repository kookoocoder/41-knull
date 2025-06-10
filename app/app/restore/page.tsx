import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import RestoreClient from './RestoreClient'

export default async function AppRestorePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }
  return <RestoreClient />
} 