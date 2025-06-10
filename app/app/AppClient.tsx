"use client"

import { useState, useEffect, useRef } from "react"
import { ImageUpload } from "@/components/image-upload"
import { RestorationOverlay } from "@/components/restoration-overlay"
import { EditingOverlay } from "@/components/editing-overlay"
import { ComparisonSlider } from "@/components/comparison-slider"
import { EditComparison } from "@/components/edit-comparison"
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
import { EditCard } from "@/components/edit-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  ImageOff,
  ArrowRight
} from "lucide-react"
import { useUserData } from '@/hooks/useUserData'
import { useRestorationHistory } from '@/hooks/useRestorationHistory'
import { useRestorationStats } from '@/hooks/useRestorationStats'
import { useViewportHeight } from '@/hooks/useViewportHeight'

export type AppState = "upload" | "processing" | "comparison"
export type AppMode = "restore" | "edit"

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

interface Edit {
  id: string
  original_url: string
  edited_url: string
  prompt: string
  created_at: string
}

export default function AppClient() {
  const { user, loading: loadingUser } = useUserData()
  const { restorations, loading: loadingRestorations, refresh: refreshRestorations } = useRestorationHistory()
  const restorationStats = useRestorationStats(restorations)
  useViewportHeight()

  const [appState, setAppState] = useState<AppState>("upload")
  const [appMode, setAppMode] = useState<AppMode>("restore")
  const [activeTab, setActiveTab] = useState<"process" | "history">("process")
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState<string>("")
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

  const handleProcess = async (prompt?: string) => {
    if (!originalImage) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image first.",
      })
      return
    }

    if (appMode === "edit" && (!prompt || prompt.trim().length === 0)) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt for image editing.",
      })
      return
    }

    setAppState("processing")
    setProgress(0)
    setProcessedImage(null)
    if (prompt) setEditPrompt(prompt)
    
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
      const endpoint = appMode === "restore" ? "/api/restore" : "/api/edit"
      const requestBody = appMode === "restore" 
        ? { inputImage: originalImage.dataUrl }
        : { inputImage: originalImage.dataUrl, prompt: prompt }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setProgress(100)
      setProcessedImage(data.output)

      try {
        const processedColors = await extractColors(data.output)
        const enhancedGradient = `linear-gradient(135deg, ${processedColors[0]}20, ${processedColors[1]}15, ${processedColors[2]}10)`
        setBackgroundGradient(enhancedGradient)
      } catch (error) {
        console.error("Error extracting processed image colors:", error)
      }

      setTimeout(() => {
        setAppState("comparison")
        toast({
          title: `${appMode === "restore" ? "Restoration" : "Edit"} complete`,
          description: `Your image has been successfully ${appMode === "restore" ? "restored" : "edited"}.`,
        })
        refreshRestorations()
      }, 1000)
    } catch (err) {
      console.error(err)
      setAppState("upload")
      toast({
        variant: "destructive",
        title: `${appMode === "restore" ? "Restoration" : "Edit"} failed`,
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      })
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }

  const handleReset = () => {
    setAppState("upload")
    setOriginalImage(null)
    setProcessedImage(null)
    setEditPrompt("")
    setProgress(0)
    setBackgroundGradient("")
  }

  const ModeSelector = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Choose Your AI Action</CardTitle>
          <CardDescription>
            Select whether you want to restore or edit your image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative cursor-pointer rounded-lg border-2 transition-all duration-200 border-border hover:border-primary/50 bg-background/50 hover:bg-primary/5"
              onClick={() => window.location.href = '/app/restore'}
            >
              <div className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-muted hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Restore Image</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fix old, damaged, or faded photos
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
                  <Badge variant="secondary" className="text-xs">Auto-Fix</Badge>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative cursor-pointer rounded-lg border-2 transition-all duration-200 border-border hover:border-primary/50 bg-background/50 hover:bg-primary/5"
              onClick={() => window.location.href = '/app/edit'}
            >
              <div className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-muted hover:bg-primary/20 transition-colors">
                  <Wand2 className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Edit Image</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transform images with AI prompts
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="secondary" className="text-xs">Creative</Badge>
                  <Badge variant="secondary" className="text-xs">Prompt-Based</Badge>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center pt-2"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Choose your transformation type</span>
              <ArrowRight className="h-4 w-4" />
              <span>Professional results</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )

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
            <p className="text-muted-foreground mt-1">Let's create something amazing today</p>
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
        
        {/* Main tabs - Process or History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="process" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="process" className="flex items-center">
                <Wand2 className="mr-2 h-4 w-4" />
                AI Processing
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <BookMarked className="mr-2 h-4 w-4" />
                Recent History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="process" className="space-y-6">
              <AnimatePresence mode="wait">
                {appState === "upload" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <ModeSelector />
                    <ImageUpload
                      onImageUpload={handleImageUpload}
                      onRestore={() => handleProcess()}
                      image={originalImage}
                      onReset={handleReset}
                      isMobile={isMobile}
                      mode={appMode}
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
                          <CardTitle className="text-sm font-medium">
                            {appMode === "restore" ? "Best photo types" : "Creative prompts"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p className="text-muted-foreground">
                            {appMode === "restore" 
                              ? "Old, faded, or scratched portraits work best with our restoration model."
                              : "Be descriptive and specific about the style or transformation you want."
                            }
                          </p>
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
                          <p className="text-muted-foreground">
                            {appMode === "restore" 
                              ? "Most images are processed in 5-10 seconds depending on complexity."
                              : "AI editing typically takes 10-15 seconds depending on the prompt complexity."
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}

                {appState === "processing" && originalImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {appMode === "restore" ? (
                      <RestorationOverlay image={originalImage} progress={progress} />
                    ) : (
                      <EditingOverlay
                        image={originalImage}
                        progress={progress}
                        onEdit={handleProcess}
                        onReset={handleReset}
                        isProcessing={true}
                        isMobile={isMobile}
                      />
                    )}
                  </motion.div>
                )}

                {appState === "comparison" && originalImage && processedImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                      <CardHeader>
                        <CardTitle>
                          {appMode === "restore" ? "Restoration Complete" : "Edit Complete"}
                        </CardTitle>
                        <CardDescription>
                          Your image has been successfully {appMode === "restore" ? "restored" : "edited"}. Compare the results below.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {appMode === "restore" ? (
                          <ComparisonSlider
                            originalImage={originalImage.dataUrl}
                            restoredImage={processedImage}
                            fileName={originalImage.file.name}
                            onReset={handleReset}
                            isMobile={isMobile}
                          />
                        ) : (
                          <EditComparison
                            originalImage={originalImage.dataUrl}
                            editedImage={processedImage}
                            prompt={editPrompt}
                            fileName={originalImage.file.name}
                            onReset={handleReset}
                            onNewEdit={() => {
                              setAppState("upload")
                              setProcessedImage(null)
                              setEditPrompt("")
                            }}
                            isMobile={isMobile}
                          />
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between py-4 px-6 border-t">
                        <Button variant="outline" onClick={handleReset}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {appMode === "restore" ? "Restore Another" : "Edit Another"}
                        </Button>
                        <Button asChild variant="default">
                          <Link href="/app/library">
                            <BookMarked className="mr-2 h-4 w-4" />
                            View in Library
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your most recent AI transformations</CardDescription>
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
                      <h3 className="mt-4 text-lg font-medium">No activity yet</h3>
                      <p className="text-muted-foreground mt-2 mb-6">
                        You haven't processed any images yet. Start by uploading a photo.
                      </p>
                      <Button onClick={() => setActiveTab('process')}>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Start Processing
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