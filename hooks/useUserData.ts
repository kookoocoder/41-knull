"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import type { User } from '@supabase/supabase-js'

// Hook to subscribe to Supabase auth state and return the current user
export function useUserData() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
    const supabase = createClient()
    // Fetch initial user
   supabase.auth.getUser()
     .then((res) => {
       setUser(res.data.user ?? null)
       setLoading(false)
     })
     .catch((error) => {
       console.error('Failed to fetch user:', error)
       setUser(null)
       setLoading(false)
     })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
} 