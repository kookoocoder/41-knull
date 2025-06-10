"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, RefreshCw, ZoomIn, Maximize, ChevronLeft, ChevronRight } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'

interface RestorationCardProps {
  original: string
  restored: string
  date: string
}

export function RestorationCard({ original, restored, date }: RestorationCardProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'restored'>('restored')
  const [position, setPosition] = useState(50)
  const [isHovering, setIsHovering] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState<'side-by-side' | 'comparison'>('side-by-side')

  const formattedDate = new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

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
    // Reset position when entering comparison mode
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
                <RefreshCw className="mr-1 h-3 w-3" />
                Restored
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            <div
              className="relative w-full overflow-hidden rounded-md border border-border/50 bg-accent/10" 
              onMouseMove={handleSliderChange}
            >
              <AspectRatio ratio={4/3}>
                {isComparing ? (
                  <div className="relative w-full h-full cursor-col-resize">
                    {/* Before image (full width) */}
                    <div className="absolute inset-0">
                      <img src={original} alt="Original" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* After image (clipped) */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${position}%` }}
                    >
                      <img 
                        src={restored} 
                        alt="Restored" 
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
                      Restored
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
                        <img src={original} alt="Original" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
                          Original
                        </div>
                      </div>
                      <div 
                        className={`w-full h-full transition-opacity duration-300 absolute inset-0 ${
                          activeTab === 'restored' ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <img src={restored} alt="Restored" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
                          Restored
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
                      <RefreshCw className="mr-2 h-4 w-4" />
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

            {!isComparing && (
              <div className="flex mt-2 gap-2">
                <Button 
                  variant={activeTab === 'original' ? "default" : "outline"} 
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setActiveTab('original')}
                >
                  <ImageIcon className="mr-1 h-3.5 w-3.5" />
                  Original
                </Button>
                <Button 
                  variant={activeTab === 'restored' ? "default" : "outline"} 
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setActiveTab('restored')}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Restored
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Restoration ({formattedDate})</DialogTitle>
          </DialogHeader>
          
          <Tabs value={dialogTab} onValueChange={(v) => setDialogTab(v as any)} className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
              <TabsTrigger value="comparison">Comparison Slider</TabsTrigger>
            </TabsList>
            
            <TabsContent value="side-by-side" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Original
                  </h3>
                  <div className="border rounded-md overflow-hidden h-[400px]">
                    <img src={original} alt="Original" className="w-full h-full object-contain"
                    style={{ width: `${position === 0 ? 100 : 100 / (position/100)}%` }} />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restored
                  </h3>
                  <div className="border rounded-md overflow-hidden h-[400px]">
                    <img src={restored} alt="Restored" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="mt-4">
              <div className="relative border rounded-md overflow-hidden" 
                onMouseMove={handleDialogSliderChange}
                style={{ height: '400px' }}
              >
                {/* Before image (full width) */}
                <div className="absolute inset-0">
                  <img src={original} alt="Original" className="w-full h-full object-contain" />
                </div>
                
                {/* After image (clipped) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${position}%` }}
                >
                  <img 
                    src={restored} 
                    alt="Restored" 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Slider */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-primary shadow-md flex items-center justify-center">
                    <ChevronLeft className="h-4 w-4 -ml-1" />
                    <ChevronRight className="h-4 w-4 -mr-1" />
                  </div>
                </div>
                
                {/* Labels */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-sm font-medium">
                  Original
                </div>
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-sm font-medium">
                  Restored
                </div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Click and drag the slider to compare the original and restored images
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 