"use client"

import React, { useState, useEffect } from 'react'
import { RestorationCard } from '@/components/restoration-card'
import { EditCard } from '../../../components/edit-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { ImageIcon, ImageOff, ArrowUpDown, Calendar, Search, RefreshCw, ArrowLeft, Wand2, Sparkles } from 'lucide-react'
import { Header } from '@/components/header'
import Link from 'next/link'

interface Restoration {
  id: string
  original_url: string
  restored_url: string
  created_at: string
}

interface Edit {
  id: string
  original_url: string
  edited_url: string
  prompt: string
  created_at: string
}

type SortOption = 'newest' | 'oldest'
type ContentType = 'all' | 'restorations' | 'edits'

export default function LibraryPage() {
  const [restorations, setRestorations] = useState<Restoration[]>([])
  const [edits, setEdits] = useState<Edit[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ContentType>('all')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    // Fetch both restorations and edits
    Promise.all([
      fetch('/api/restore', { method: 'GET' }),
      fetch('/api/edit', { method: 'GET' })
    ])
      .then(async ([restoreRes, editRes]) => {
        const restoreData = restoreRes.status === 401 ? { restorations: [] } : await restoreRes.json()
        const editData = editRes.status === 401 ? { edits: [] } : await editRes.json()
        
        if (restoreData.error && restoreRes.status !== 401) {
          throw new Error(restoreData.error)
        }
        if (editData.error && editRes.status !== 401) {
          throw new Error(editData.error)
        }
        
        return { restorations: restoreData.restorations || [], edits: editData.edits || [] }
      })
      .then((data) => {
        setRestorations(data.restorations)
        setEdits(data.edits)
      })
      .catch((err) => {
        console.error(err)
        toast({ variant: 'destructive', title: 'Error', description: err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  // Sort items based on the current sort option
  const sortedRestorations = [...restorations].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOption === 'newest' ? dateB - dateA : dateA - dateB
  })

  const sortedEdits = [...edits].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOption === 'newest' ? dateB - dateA : dateA - dateB
  })

  // Search functionality
  const filteredRestorations = sortedRestorations.filter(res => {
    if (!searchQuery) return true
    const date = new Date(res.created_at).toLocaleDateString().toLowerCase()
    return date.includes(searchQuery.toLowerCase())
  })

  const filteredEdits = sortedEdits.filter(edit => {
    if (!searchQuery) return true
    const date = new Date(edit.created_at).toLocaleDateString().toLowerCase()
    const prompt = edit.prompt.toLowerCase()
    return date.includes(searchQuery.toLowerCase()) || prompt.includes(searchQuery.toLowerCase())
  })

  // Combined and sorted items for "All" tab
  const allItems = [
    ...filteredRestorations.map(r => ({ ...r, type: 'restoration' as const })),
    ...filteredEdits.map(e => ({ ...e, type: 'edit' as const }))
  ].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOption === 'newest' ? dateB - dateA : dateA - dateB
  })

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
  if (restorations.length === 0 && edits.length === 0) {
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
            <h1 className="text-3xl font-semibold">Your Library</h1>
          </div>
          <div className="mt-10 border border-dashed rounded-lg flex flex-col items-center justify-center py-16">
            <div className="bg-muted/60 p-6 rounded-full">
              <ImageOff className="h-12 w-12 text-muted-foreground/60" />
            </div>
            <h3 className="mt-6 text-xl font-medium">No images yet</h3>
            <p className="text-muted-foreground mt-2 mb-6 text-center max-w-md">
              You haven't restored or edited any images yet. Start by restoring an old photo or editing an existing one.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Restore Images
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/edit">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Edit Images
                </Link>
              </Button>
            </div>
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
              Your Library
            </motion.h1>
          </div>
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Sparkles className="mr-2 h-4 w-4" />
                Restore More
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/edit">
                <Wand2 className="mr-2 h-4 w-4" />
                Edit Images
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="grid gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="all">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  All ({allItems.length})
                </TabsTrigger>
                <TabsTrigger value="restorations">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Restorations ({filteredRestorations.length})
                </TabsTrigger>
                <TabsTrigger value="edits">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Edits ({filteredEdits.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="w-full sm:w-[200px] pl-8"
                    placeholder={activeTab === 'edits' ? "Search by prompt or date..." : "Search by date..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                  <SelectTrigger className="w-[130px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allItems.map((item) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.type === 'restoration' ? (
                      <RestorationCard 
                        original={(item as Restoration).original_url}
                        restored={(item as Restoration).restored_url}
                        date={(item as Restoration).created_at}
                      />
                    ) : (
                      <EditCard edit={item as Edit} />
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="restorations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestorations.map((restoration) => (
                  <motion.div
                    key={restoration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RestorationCard 
                      original={restoration.original_url}
                      restored={restoration.restored_url}
                      date={restoration.created_at}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="edits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEdits.map((edit) => (
                  <motion.div
                    key={edit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EditCard edit={edit} />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  )
} 