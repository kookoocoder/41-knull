"use client"

import { useState, useEffect } from "react"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export type AppState = "upload" | "processing" | "comparison"

export interface ImageData {
  file: File
  dataUrl: string
  colors?: string[]
  source?: "upload" | "camera"
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload")
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [restoredImage, setRestoredImage] = useState<string | null>(null)
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
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputImage: originalImage.dataUrl,
        }),
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
      setRestoredImage(data.output)

      // Update gradient with restored image colors
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
      
      if (!isLimitReached) {
        toast({
          variant: "destructive",
          title: "Restoration failed",
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

  return (
    <>
      <AlertDialog open={isLimitReached} onOpenChange={setIsLimitReached}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anonymous Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You've reached the maximum of 2 restorations allowed for anonymous users. 
              Sign in to restore unlimited images and access your restoration history.
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
              {appState === "upload" && (
                <>
                  <HeroSection isMobile={isMobile} />
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onRestore={handleRestore}
                    image={originalImage}
                    onReset={handleReset}
                    isMobile={isMobile}
                  />
                  <ExampleImages onSelectExample={handleImageUpload} isMobile={isMobile} />
                  <FeaturesSection />
                </>
              )}

              {appState === "processing" && originalImage && (
                <RestorationOverlay image={originalImage} progress={progress} />
              )}

              {appState === "comparison" && originalImage && restoredImage && (
                <ComparisonSlider
                  originalImage={originalImage.dataUrl}
                  restoredImage={restoredImage}
                  fileName={originalImage.file.name}
                  onReset={handleReset}
                  onEdit={handleEdit}
                  isMobile={isMobile}
                />
              )}
            </div>
          </main>

          <Footer />
          <Toaster />
        </div>
      </div>
    </>
  )
}
