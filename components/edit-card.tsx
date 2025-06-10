"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wand2, ZoomIn, Maximize, Quote } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'

interface EditCardProps {
  edit: {
    id: string
    original_url: string
    edited_url: string
    prompt: string
    created_at: string
  }
}

export function EditCard({ edit }: EditCardProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'edited'>('edited')
  const [position, setPosition] = useState(50)
  const [isHovering, setIsHovering] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState<'side-by-side' | 'comparison'>('side-by-side')

  const formattedDate = new Date(edit.created_at).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Truncate prompt for display
  const truncatedPrompt = edit.prompt.length > 60 ? `${edit.prompt.substring(0, 60)}...` : edit.prompt

  // Handle slider for comparison view
  const handleSliderChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isComparing) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = (x / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, percent)))
  }, [isComparing])
  
  // Handle dialog slider
  const handleDialogSliderChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = (x / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, percent)))
  }, [])

  const enterComparisonMode = () => {
    setIsComparing(true)
    setPosition(50)
  }

  const exitComparisonMode = () => {
    setIsComparing(false)
  }

  const openFullSizeDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDialogOpen(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/80"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false)
            setIsComparing(false)
          }}
        >
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-medium">
                <span className="text-muted-foreground">{formattedDate}</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <Wand2 className="mr-1 h-3 w-3" />
                Edited
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-3 space-y-3">
            {/* Prompt Display */}
            <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-md">
              <Quote className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed" title={edit.prompt}>
                {truncatedPrompt}
              </p>
            </div>

            <div
              className="relative w-full overflow-hidden rounded-md border border-border/50 bg-accent/10" 
              onMouseMove={handleSliderChange}
            >
              <AspectRatio ratio={4/3}>
                {isComparing ? (
                  <div className="relative w-full h-full cursor-col-resize">
                    {/* Before image (full width) */}
                    <div className="absolute inset-0">
                      <img src={edit.original_url} alt="Original" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* After image (clipped) */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${position}%` }}
                    >
                      <img 
                        src={edit.edited_url} 
                        alt="Edited" 
                        className="w-full h-full object-cover"
                        style={{ width: `${100 / (position/100)}%` }}
                      />
                    </div>
                    
                    {/* Slider */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-primary shadow-md" />
                    </div>
                    
                    {/* Labels */}
                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
                      Original
                    </div>
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
                      Edited
                    </div>
                    
                    {/* Exit comparison button */}
                    <Button 
                      className="absolute bottom-2 right-2" 
                      size="sm" 
                      variant="secondary"
                      onClick={exitComparisonMode}
                    >
                      Exit Comparison
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-full">
                    <div className="flex w-full h-full">
                      <div 
                        className={`w-full h-full transition-opacity duration-300 absolute inset-0 ${
                          activeTab === 'original' ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <img src={edit.original_url} alt="Original" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
                          Original
                        </div>
                      </div>
                      <div 
                        className={`w-full h-full transition-opacity duration-300 absolute inset-0 ${
                          activeTab === 'edited' ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <img src={edit.edited_url} alt="Edited" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
                          Edited
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </AspectRatio>
              
              <AnimatePresence>
                {isHovering && !isComparing && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center gap-2 bg-background/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button 
                      variant="secondary" 
                      onClick={enterComparisonMode}
                      className="shadow-md"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Compare
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={openFullSizeDialog}
                      className="shadow-md"
                    >
                      <Maximize className="mr-2 h-4 w-4" />
                      Full Size
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as 'original' | 'edited')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original" className="text-xs">Original</TabsTrigger>
                <TabsTrigger value="edited" className="text-xs">Edited</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Full Size Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Edit Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 space-y-4">
            <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
              <Quote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {edit.prompt}
              </p>
            </div>

            <Tabs value={dialogTab} onValueChange={(v) => setDialogTab(v as 'side-by-side' | 'comparison')}>
              <TabsList>
                <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>
              
              <TabsContent value="side-by-side" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Original</h4>
                    <AspectRatio ratio={4/3}>
                      <img src={edit.original_url} alt="Original" className="w-full h-full object-cover rounded-md" />
                    </AspectRatio>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Edited</h4>
                    <AspectRatio ratio={4/3}>
                      <img src={edit.edited_url} alt="Edited" className="w-full h-full object-cover rounded-md" />
                    </AspectRatio>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="comparison">
                <div className="relative w-full overflow-hidden rounded-md" onMouseMove={handleDialogSliderChange}>
                  <AspectRatio ratio={16/9}>
                    <div className="relative w-full h-full cursor-col-resize">
                      <div className="absolute inset-0">
                        <img src={edit.original_url} alt="Original" className="w-full h-full object-cover" />
                      </div>
                      <div 
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${position}%` }}
                      >
                        <img 
                          src={edit.edited_url} 
                          alt="Edited" 
                          className="w-full h-full object-cover"
                          style={{ width: `${100 / (position/100)}%` }}
                        />
                      </div>
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-primary shadow-md" />
                      </div>
                      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-sm font-medium">
                        Original
                      </div>
                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-sm font-medium">
                        Edited
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="p-6 pt-0">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 