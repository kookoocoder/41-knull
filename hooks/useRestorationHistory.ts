"use client"

import { useState, useEffect, useCallback } from 'react'

// Interface matching the REST API response
interface Restoration {
  id: string
  original_url: string
  restored_url: string
  created_at: string
}

// Hook to fetch, sort, and refresh user restoration history
export function useRestorationHistory() {
  const [restorations, setRestorations] = useState<Restoration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/restore', { method: 'GET' })
      if (res.status === 401) {
        setRestorations([])
        return
      }
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      // Sort newest first
      const sorted: Restoration[] = data.restorations.sort(
  (a: Restoration, b: Restoration) => {
    const dateA = new Date(a.created_at)
    const dateB = new Date(b.created_at)
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      console.warn('Invalid date format in restoration data')
      return 0
    }
    return dateB.getTime() - dateA.getTime()
  }
 )
      setRestorations(sorted)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { restorations, loading, error, refresh: fetchHistory }
} 