"use client"

import { useState, useEffect, useRef } from "react"
import { ImageUpload } from "@/components/image-upload"
import { RestorationOverlay } from "@/components/restoration-overlay"
import { ComparisonSlider } from "@/components/comparison-slider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { extractColors } from "@/lib/color-utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ExampleImages } from "@/components/example-images"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowLeft, BookMarked } from "lucide-react"
import { useUserData } from '@/hooks/useUserData'
import { useViewportHeight } from '@/hooks/useViewportHeight'
import Link from "next/link"

export type AppState = "upload" | "processing" | "comparison"

export interface ImageData {
  file: File
  dataUrl: string
  colors?: string[]
  source?: "upload" | "camera"
}

export default function RestoreClient() {
  const { user, loading: loadingUser } = useUserData()
  useViewportHeight()

  const [appState, setAppState] = useState<AppState>("upload")
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [restoredImage, setRestoredImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [backgroundGradient, setBackgroundGradient] = useState<string>("")
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
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

  const handleEdit = (imageDataUrl: string) => {
    // Create a File object from the data URL for editing
    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `restored_${originalImage?.file.name || 'image.jpg'}`, { type: blob.type })
        const imageData: ImageData = {
          file,
          dataUrl: imageDataUrl,
          source: "upload"
        }
        
        // Navigate to edit page with the image data
        router.push('/app/edit')
        
        // Store the image data in session storage for the edit page
        sessionStorage.setItem('editImageData', JSON.stringify(imageData))
      })
      .catch(error => {
        console.error('Error preparing image for editing:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to prepare image for editing. Please try again.",
        })
      })
  }

  const RestoreHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-4 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/app')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <Button asChild variant="outline" size="sm">
          <Link href="/app/library">
            <BookMarked className="mr-2 h-4 w-4" />
            View Library
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-3">
        <div className="p-3 rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">AI Image Restoration</h1>
      </div>
      
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! Transform your old, damaged, or faded photos into stunning, high-quality images.
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="text-sm">Unlimited Restorations</Badge>
        <Badge variant="secondary" className="text-sm">AI-Powered</Badge>
        <Badge variant="secondary" className="text-sm">Instant Processing</Badge>
        <Badge variant="secondary" className="text-sm">Auto-Save to Library</Badge>
      </div>
    </motion.div>
  )

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

        <main className="flex-1 container py-6 md:py-12">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            <AnimatePresence mode="wait">
              {appState === "upload" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 md:space-y-12"
                >
                  <RestoreHeader />
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onRestore={handleRestore}
                    image={originalImage}
                    onReset={handleReset}
                    isMobile={isMobile}
                    mode="restore"
                  />
                  <ExampleImages onSelectExample={handleImageUpload} isMobile={isMobile} />
                  
                  {/* Tips specific to restoration */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Best photo types</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">Old, faded, scratched, or damaged portraits work best with our restoration model.</p>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RestorationOverlay image={originalImage} progress={progress} />
                </motion.div>
              )}

              {appState === "comparison" && originalImage && restoredImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle>Restoration Complete</CardTitle>
                      <p className="text-muted-foreground">
                        Your image has been successfully restored and saved to your library. Compare the results below.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ComparisonSlider
                        originalImage={originalImage.dataUrl}
                        restoredImage={restoredImage}
                        fileName={originalImage.file.name}
                        onReset={handleReset}
                        onEdit={handleEdit}
                        isMobile={isMobile}
                      />
                    </CardContent>
                    <div className="flex justify-between py-4 px-6 border-t">
                      <Button variant="outline" onClick={handleReset}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Restore Another
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleEdit(restoredImage!)}>
                          Edit This Image
                        </Button>
                        <Button asChild variant="default">
                          <Link href="/app/library">
                            <BookMarked className="mr-2 h-4 w-4" />
                            View in Library
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <Footer />
        <Toaster />
      </div>
    </div>
  )
} 