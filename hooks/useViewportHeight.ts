"use client"

import { useEffect } from 'react'

// Hook to set --vh CSS variable for mobile viewport height fixes
export function useViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setVh()
    window.addEventListener('resize', setVh)
    return () => window.removeEventListener('resize', setVh)
  }, [])
} 