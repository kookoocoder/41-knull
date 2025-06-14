"use client"

import { useState, useEffect } from "react"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles, Wand2, ImageIcon, Zap, ArrowRight, CheckCircle2 } from "lucide-react"

export type AppState = "upload" | "processing" | "comparison"
export type AppMode = "restore" | "edit"

export interface ImageData {
  file: File
  dataUrl: string
  colors?: string[]
  source?: "upload" | "camera"
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload")
  const [appMode, setAppMode] = useState<AppMode>("restore")
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [backgroundGradient, setBackgroundGradient] = useState<string>("")
  const [isLimitReached, setIsLimitReached] = useState(false)
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()

  const handleImageUpload = async (imageData: ImageData) => {
    setOriginalImage(imageData)

    // Extract colors for background gradient
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

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
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
        // Check if it's the anonymous limit error
        if (res.status === 403 && data.error.includes("Anonymous limit reached")) {
          setIsLimitReached(true)
          throw new Error(data.error)
        }
        throw new Error(data.error)
      }

      setProgress(100)
      setProcessedImage(data.output)

      // Update gradient with processed image colors
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
      }, 1000)
    } catch (err) {
      console.error(err)
      setAppState("upload")
      
      if (!isLimitReached) {
        toast({
          variant: "destructive",
          title: `${appMode === "restore" ? "Restoration" : "Edit"} failed`,
          description: err instanceof Error ? err.message : "An unknown error occurred.",
        })
      }
    } finally {
      clearInterval(progressInterval)
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
        router.push('/edit')
        
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

  // Add viewport height fix for mobile browsers
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    setVh()
    window.addEventListener("resize", setVh)
    return () => window.removeEventListener("resize", setVh)
  }, [])

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
              onClick={() => router.push('/restore')}
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
              onClick={() => router.push('/edit')}
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

  return (
    <>
      <AlertDialog open={isLimitReached} onOpenChange={setIsLimitReached}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anonymous Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You've reached the maximum of 2 {appMode === "restore" ? "restorations" : "edits"} allowed for anonymous users. 
              Sign in to {appMode === "restore" ? "restore" : "edit"} unlimited images and access your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLimitReached(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/auth/login')}>Sign In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className="min-h-screen min-h-[calc(var(--vh,1vh)*100)] bg-background transition-all duration-1000 ease-out"
        style={{
          backgroundImage: backgroundGradient,
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
                    <HeroSection isMobile={isMobile} />
                    <ModeSelector />
                    <ImageUpload
                      onImageUpload={handleImageUpload}
                      onRestore={() => handleProcess()}
                      image={originalImage}
                      onReset={handleReset}
                      isMobile={isMobile}
                      mode={appMode}
                    />
                    <ExampleImages onSelectExample={handleImageUpload} isMobile={isMobile} />
                    <FeaturesSection />
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
                    {appMode === "restore" ? (
                      <ComparisonSlider
                        originalImage={originalImage.dataUrl}
                        restoredImage={processedImage}
                        fileName={originalImage.file.name}
                        onReset={handleReset}
                        onEdit={handleEdit}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          <Footer />
          <Toaster />
        </div>
      </div>
    </>
  )
}
