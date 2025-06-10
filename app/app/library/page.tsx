"use client"

import React, { useState, useEffect } from 'react'
import { RestorationCard } from '@/components/restoration-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { ImageIcon, ImageOff, ArrowUpDown, Calendar, Search, RefreshCw, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import Link from 'next/link'

interface Restoration {
  id: string
  original_url: string
  restored_url: string
  created_at: string
}

type SortOption = 'newest' | 'oldest'

export default function LibraryPage() {
  const [restorations, setRestorations] = useState<Restoration[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/restore', { method: 'GET' })
      .then(async (res) => {
        if (res.status === 401) {
          toast({ variant: 'destructive', title: 'Unauthorized', description: 'Please log in to view your library.' })
          return { restorations: [] }
        }
        const data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }
        return data
      })
      .then((data) => {
        setRestorations(data.restorations || [])
      })
      .catch((err) => {
        console.error(err)
        toast({ variant: 'destructive', title: 'Error', description: err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  // Sort restorations based on the current sort option
  const sortedRestorations = [...restorations].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    
    if (sortOption === 'newest') {
      return dateB - dateA
    } else {
      return dateA - dateB
    }
  })

  // Search functionality (by date in this case since we don't have titles yet)
  const filteredRestorations = sortedRestorations.filter(res => {
    if (!searchQuery) return true
    
    const date = new Date(res.created_at).toLocaleDateString().toLowerCase()
    return date.includes(searchQuery.toLowerCase())
  })

  // Group restorations by date (for the calendar tab)
  const groupedRestorations = filteredRestorations.reduce<Record<string, Restoration[]>>((acc, restoration) => {
    const date = new Date(restoration.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(restoration)
    return acc
  }, {})

  // Loading skeleton
  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-8 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </>
    )
  }

  // Empty state
  if (restorations.length === 0) {
    return (
      <>
        <Header />
        <div className="container max-w-6xl py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Link>
            </Button>
            <h1 className="text-3xl font-semibold">Your Restorations</h1>
          </div>
          <div className="mt-10 border border-dashed rounded-lg flex flex-col items-center justify-center py-16">
            <div className="bg-muted/60 p-6 rounded-full">
              <ImageOff className="h-12 w-12 text-muted-foreground/60" />
            </div>
            <h3 className="mt-6 text-xl font-medium">No restorations yet</h3>
            <p className="text-muted-foreground mt-2 mb-6 text-center max-w-md">
              You haven't restored any images yet. Head to the dashboard to restore your first image.
            </p>
            <Button asChild>
              <a href="/app">
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore Images
              </a>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Link>
            </Button>
            <motion.h1 
              className="text-3xl font-semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              Your Restorations
            </motion.h1>
          </div>
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button variant="outline" size="sm" asChild>
              <a href="/app">
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore More
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="grid gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs defaultValue="grid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="grid">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Grid View
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date View
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="w-full sm:w-[180px] pl-8"
                    placeholder="Search by date..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select 
                  value={sortOption} 
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue>
                      <div className="flex items-center">
                        <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                        {sortOption === 'newest' ? 'Newest First' : 'Oldest First'}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="grid" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestorations.map((res) => (
                  <RestorationCard
                    key={res.id}
                    original={res.original_url}
                    restored={res.restored_url}
                    date={res.created_at}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="calendar">
              <ScrollArea className="h-[calc(100vh-220px)] pr-4">
                <div className="space-y-8 py-6">
                  {Object.entries(groupedRestorations).map(([date, items]) => (
                    <div key={date}>
                      <div className="mb-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                        <h3 className="text-lg font-medium border-b pb-2">{date} ({items.length} items)</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((res) => (
                          <RestorationCard
                            key={res.id}
                            original={res.original_url}
                            restored={res.restored_url}
                            date={res.created_at}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  )
} 