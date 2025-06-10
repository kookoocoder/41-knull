"use client"

import { useState, useEffect } from "react"
import { ImageUpload } from "@/components/image-upload"
import { EditingOverlay } from "@/components/editing-overlay"
import { EditComparison } from "@/components/edit-comparison"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { extractColors } from "@/lib/color-utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Sparkles, Upload } from "lucide-react"
import { motion } from "framer-motion"

export type EditState = "upload" | "editing" | "comparison"

export interface ImageData {
  file: File
  dataUrl: string
  colors?: string[]
  source?: "upload" | "camera"
}

interface EditPageProps {
  initialImage?: ImageData
}

export default function EditPage({ initialImage }: EditPageProps) {
  const [editState, setEditState] = useState<EditState>(initialImage ? "editing" : "upload")
  const [originalImage, setOriginalImage] = useState<ImageData | null>(initialImage || null)
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [backgroundGradient, setBackgroundGradient] = useState<string>("")
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<string>("")
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()

  // Check for stored image data from restoration page
  useEffect(() => {
    const storedImageData = sessionStorage.getItem('editImageData')
    if (storedImageData) {
      try {
        const imageData = JSON.parse(storedImageData) as ImageData
        setOriginalImage(imageData)
        setEditState("editing")
        
        // Extract colors for background gradient
        extractColors(imageData.dataUrl).then(colors => {
          const gradient = `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}10, ${colors[2]}05)`
          setBackgroundGradient(gradient)
        }).catch(error => {
          console.error("Error extracting colors:", error)
        })
        
        // Clear the stored data
        sessionStorage.removeItem('editImageData')
      } catch (error) {
        console.error('Error parsing stored image data:', error)
        sessionStorage.removeItem('editImageData')
      }
    }
  }, [])

  const handleImageUpload = async (imageData: ImageData) => {
    setOriginalImage(imageData)
    setEditState("editing")

    // Extract colors for background gradient
    try {
      const colors = await extractColors(imageData.dataUrl)
      const gradient = `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}10, ${colors[2]}05)`
      setBackgroundGradient(gradient)
    } catch (error) {
      console.error("Error extracting colors:", error)
    }
  }

  const handleEdit = async (prompt: string) => {
    if (!originalImage) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image first.",
      })
      return
    }

    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a description of how you want to edit the image.",
      })
      return
    }

    setCurrentPrompt(prompt)
    setEditState("editing")
    setProgress(0)
    setEditedImage(null)

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
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputImage: originalImage.dataUrl,
          prompt: prompt.trim(),
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
      setEditedImage(data.output)

      // Update gradient with edited image colors
      try {
        const editedColors = await extractColors(data.output)
        const enhancedGradient = `linear-gradient(135deg, ${editedColors[0]}20, ${editedColors[1]}15, ${editedColors[2]}10)`
        setBackgroundGradient(enhancedGradient)
      } catch (error) {
        console.error("Error extracting edited image colors:", error)
      }

      setTimeout(() => {
        setEditState("comparison")
        toast({
          title: "Edit complete",
          description: "Your image has been successfully edited.",
        })
      }, 1000)
    } catch (err) {
      console.error(err)
      setEditState("editing")
      
      if (!isLimitReached) {
        toast({
          variant: "destructive",
          title: "Edit failed",
          description: err instanceof Error ? err.message : "An unknown error occurred.",
        })
      }
    } finally {
      clearInterval(progressInterval)
    }
  }

  const handleReset = () => {
    setEditState("upload")
    setOriginalImage(null)
    setEditedImage(null)
    setProgress(0)
    setBackgroundGradient("")
    setCurrentPrompt("")
  }

  const handleNewEdit = () => {
    setEditState("editing")
    setEditedImage(null)
    setProgress(0)
    setCurrentPrompt("")
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
              You've reached the maximum of 2 edits allowed for anonymous users. 
              Sign in to edit unlimited images and access your edit history.
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
              {editState === "upload" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4 md:space-y-6"
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="relative">
                        <Wand2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
                        <div className="absolute inset-0 h-8 w-8 md:h-10 md:w-10 text-primary/30 animate-ping">
                          <Wand2 className="h-8 w-8 md:h-10 md:w-10" />
                        </div>
                      </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Edit Your Images with AI
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      Transform your photos with natural language prompts. Upload an image and describe how you want it changed.
                    </p>
                  </motion.div>

                  <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Upload Image to Edit
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ImageUpload
                        onImageUpload={handleImageUpload}
                        image={originalImage}
                        onReset={handleReset}
                        isMobile={isMobile}
                        isEditMode={true}
                      />
                    </CardContent>
                  </Card>
                </>
              )}

              {editState === "editing" && originalImage && (
                <EditingOverlay 
                  image={originalImage} 
                  progress={progress} 
                  onEdit={handleEdit}
                  onReset={handleReset}
                  isProcessing={progress > 0}
                  isMobile={isMobile}
                />
              )}

              {editState === "comparison" && originalImage && editedImage && (
                <EditComparison
                  originalImage={originalImage.dataUrl}
                  editedImage={editedImage}
                  fileName={originalImage.file.name}
                  prompt={currentPrompt}
                  onReset={handleReset}
                  onNewEdit={handleNewEdit}
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