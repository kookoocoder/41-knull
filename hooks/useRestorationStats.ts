"use client"

import { useMemo } from 'react'

// Interface for a single restoration entry
interface Restoration {
  id: string
  original_url: string
  restored_url: string
  created_at: string
}

// Hook to calculate total restorations, this week's count, and a placeholder average processing time
export function useRestorationStats(restorations: Restoration[]) {
  return useMemo(() => {
    const total = restorations.length
    // Count how many restorations in the past 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeek = restorations.filter(r => new Date(r.created_at) > oneWeekAgo).length
    // Placeholder: random average processing time between 4–7s
    const averageTimeMs = Math.floor(Math.random() * 3000) + 4000
    return { total, thisWeek, averageTimeMs }
  }, [restorations])
} 