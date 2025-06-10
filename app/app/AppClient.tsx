"use client"

import { useState, useEffect, useRef } from "react"
import { ImageUpload } from "@/components/image-upload"
import { RestorationOverlay } from "@/components/restoration-overlay"
import { ComparisonSlider } from "@/components/comparison-slider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { extractColors } from "@/lib/color-utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ExampleImages } from "@/components/example-images"
import { RestorationCard } from "@/components/restoration-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  CircleUser,
  Wand2,
  ImagePlus,
  BookMarked,
  ExternalLink,
  RotateCcw,
  Clock,
  TrendingUp,
  Settings2,
  Shield,
  Sparkles,
  Zap,
  ThumbsUp,
  CheckCircle2,
  ImageOff
} from "lucide-react"
import { useUserData } from '@/hooks/useUserData'
import { useRestorationHistory } from '@/hooks/useRestorationHistory'
import { useRestorationStats } from '@/hooks/useRestorationStats'
import { useViewportHeight } from '@/hooks/useViewportHeight'

export type AppState = "upload" | "processing" | "comparison"

export interface ImageData {
  file: File
  dataUrl: string
  colors?: string[]
  source?: "upload" | "camera"
}

interface Restoration {
  id: string
  original_url: string
  restored_url: string
  created_at: string
}

export default function AppClient() {
  const { user, loading: loadingUser } = useUserData()
  const { restorations, loading: loadingRestorations, refresh: refreshRestorations } = useRestorationHistory()
  const restorationStats = useRestorationStats(restorations)
  useViewportHeight()

  const [appState, setAppState] = useState<AppState>("upload")
  const [activeTab, setActiveTab] = useState<"restore" | "history">("restore")
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [restoredImage, setRestoredImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [backgroundGradient, setBackgroundGradient] = useState<string>("")
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleImageUpload = async (imageData: ImageData) => {
    setOriginalImage(imageData)

    try {
      const colors = await extractColors(imageData.dataUrl)
      const gradient = `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}10, ${colors[2]}05)`
      setBackgroundGradient(gradient)
    } catch (error) {
      console.error("Error extracting colors:", error)
    }
  }

  const handleRestore = async () => {
    if (!originalImage) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image first.",
      })
      return
    }

    setAppState("processing")
    setProgress(0)
    setRestoredImage(null)
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 800)

    try {
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputImage: originalImage.dataUrl,
        }),
      })

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setProgress(100)
      setRestoredImage(data.output)

      try {
        const restoredColors = await extractColors(data.output)
        const enhancedGradient = `linear-gradient(135deg, ${restoredColors[0]}20, ${restoredColors[1]}15, ${restoredColors[2]}10)`
        setBackgroundGradient(enhancedGradient)
      } catch (error) {
        console.error("Error extracting restored image colors:", error)
      }

      setTimeout(() => {
        setAppState("comparison")
        toast({
          title: "Restoration complete",
          description: "Your image has been successfully restored.",
        })
        refreshRestorations()
      }, 1000)
    } catch (err) {
      console.error(err)
      setAppState("upload")
      toast({
        variant: "destructive",
        title: "Restoration failed",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      })
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }

  const handleReset = () => {
    setAppState("upload")
    setOriginalImage(null)
    setRestoredImage(null)
    setProgress(0)
    setBackgroundGradient("")
  }

  const renderDashboard = () => {
    return (
      <div className="space-y-6 md:space-y-8">
        {/* Welcome section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}</h1>
            <p className="text-muted-foreground mt-1">Let's restore some beautiful memories today</p>
          </motion.div>
          
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button asChild variant="outline" size="sm">
              <Link href="/app/library">
                <BookMarked className="mr-2 h-4 w-4" />
                View Library
              </Link>
            </Button>
          </motion.div>
        </div>
        
        {/* Main tabs - Restore or History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="restore" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="restore" className="flex items-center">
                <Wand2 className="mr-2 h-4 w-4" />
                Restore Image
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <BookMarked className="mr-2 h-4 w-4" />
                Recent History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="restore" className="space-y-6">
              {appState === "upload" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                      <ImageUpload
                        onImageUpload={handleImageUpload}
                        onRestore={handleRestore}
                        image={originalImage}
                        onReset={handleReset}
                        isMobile={isMobile}
                      />
                  
                  {/* Tips */}
                  <motion.div 
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Best photo types</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">Old, faded, or scratched portraits work best with our restoration model.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">File specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">For best results, use JPG or PNG files under 10MB with clear subjects.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Processing time</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">Most images are processed in 5-10 seconds depending on complexity.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {appState === "processing" && originalImage && (
                <RestorationOverlay image={originalImage} progress={progress} />
              )}

              {appState === "comparison" && originalImage && restoredImage && (
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle>Restoration Complete</CardTitle>
                    <CardDescription>
                      Your image has been successfully restored. Compare the results below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComparisonSlider
                      originalImage={originalImage.dataUrl}
                      restoredImage={restoredImage}
                      fileName={originalImage.file.name}
                      onReset={handleReset}
                      isMobile={isMobile}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between py-4 px-6 border-t">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore Another
                    </Button>
                    <Button asChild variant="default">
                      <Link href="/app/library">
                        <BookMarked className="mr-2 h-4 w-4" />
                        View in Library
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Restorations</CardTitle>
                  <CardDescription>Your most recent image restorations</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRestorations ? (
                    <div className="space-y-4">
                      <Skeleton className="h-[200px] w-full rounded-lg" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[60px]" />
                      </div>
                    </div>
                  ) : restorations.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <ImageOff className="mx-auto h-12 w-12 text-muted-foreground/60" />
                      <h3 className="mt-4 text-lg font-medium">No restorations yet</h3>
                      <p className="text-muted-foreground mt-2 mb-6">
                        You haven't restored any images yet. Start by uploading a photo.
                      </p>
                      <Button onClick={() => setActiveTab('restore')}>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Restore Your First Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Carousel className="w-full">
                        <CarouselContent>
                          {restorations.slice(0, 5).map((restoration) => (
                            <CarouselItem key={restoration.id} className="md:basis-1/2 lg:basis-1/3">
                              <div className="p-1">
                                <RestorationCard
                                  original={restoration.original_url}
                                  restored={restoration.restored_url}
                                  date={restoration.created_at}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                      
                      <div className="flex justify-end mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href="/app/library">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View All
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen min-h-[calc(var(--vh,1vh)*100)] bg-background transition-all duration-1000 ease-out"
      style={{
        backgroundImage: backgroundGradient || "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen min-h-[calc(var(--vh,1vh)*100)] bg-background/80 backdrop-blur-[1px]">
        <Header />

        <main className="flex-1 container py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div 
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderDashboard()}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
        <Toaster />
      </div>
    </div>
  )
} 