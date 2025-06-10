import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import EditClient from './EditClient'

export default async function AppEditPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }
  return <EditClient />
} 