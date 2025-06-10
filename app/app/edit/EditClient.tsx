"use client"

import { useState, useEffect, useRef } from "react"
import { ImageUpload } from "@/components/image-upload"
import { EditingOverlay } from "@/components/editing-overlay"
import { EditComparison } from "@/components/edit-comparison"
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
import { Wand2, ArrowLeft, BookMarked } from "lucide-react"
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

export default function EditClient() {
  const { user, loading: loadingUser } = useUserData()
  useViewportHeight()

  const [appState, setAppState] = useState<AppState>("upload")
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [backgroundGradient, setBackgroundGradient] = useState<string>("")
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check for image data from session storage on mount
  useEffect(() => {
    const storedImageData = sessionStorage.getItem('editImageData')
    if (storedImageData) {
      try {
        const imageData = JSON.parse(storedImageData)
        setOriginalImage(imageData)
        sessionStorage.removeItem('editImageData')
        
        // Extract colors for background gradient
        extractColors(imageData.dataUrl).then(colors => {
          const gradient = `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}10, ${colors[2]}05)`
          setBackgroundGradient(gradient)
        }).catch(console.error)
      } catch (error) {
        console.error('Error parsing stored image data:', error)
        sessionStorage.removeItem('editImageData')
      }
    }
  }, [])

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

  const handleEdit = async (prompt: string) => {
    if (!originalImage) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image first.",
      })
      return
    }

    if (!prompt || prompt.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt for image editing.",
      })
      return
    }

    setAppState("processing")
    setProgress(0)
    setEditedImage(null)
    setEditPrompt(prompt)
    
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
        throw new Error(data.error)
      }

      setProgress(100)
      setEditedImage(data.output)

      try {
        const editedColors = await extractColors(data.output)
        const enhancedGradient = `linear-gradient(135deg, ${editedColors[0]}20, ${editedColors[1]}15, ${editedColors[2]}10)`
        setBackgroundGradient(enhancedGradient)
      } catch (error) {
        console.error("Error extracting edited image colors:", error)
      }

      setTimeout(() => {
        setAppState("comparison")
        toast({
          title: "Edit complete",
          description: "Your image has been successfully edited.",
        })
      }, 1000)
    } catch (err) {
      console.error(err)
      setAppState("upload")
      toast({
        variant: "destructive",
        title: "Edit failed",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      })
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }

  const handleReset = () => {
    setAppState("upload")
    setOriginalImage(null)
    setEditedImage(null)
    setEditPrompt("")
    setProgress(0)
    setBackgroundGradient("")
  }

  const handleNewEdit = () => {
    setAppState("upload")
    setEditedImage(null)
    setEditPrompt("")
  }

  const EditHeader = () => (
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
          <Wand2 className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">AI Image Editing</h1>
      </div>
      
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! Transform your images with natural language prompts using advanced AI.
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="text-sm">Unlimited Edits</Badge>
        <Badge variant="secondary" className="text-sm">Natural Language</Badge>
        <Badge variant="secondary" className="text-sm">Creative AI</Badge>
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
                  <EditHeader />
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onRestore={() => {}} // Not used in edit mode
                    image={originalImage}
                    onReset={handleReset}
                    isMobile={isMobile}
                    mode="edit"
                  />
                  {!originalImage && (
                    <ExampleImages onSelectExample={handleImageUpload} isMobile={isMobile} />
                  )}
                  
                  {/* Tips specific to editing */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Creative prompts</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">Be descriptive and specific about the style or transformation you want to achieve.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Best results</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">Clear, high-quality images with good contrast work best for AI editing.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Processing time</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">AI editing typically takes 10-15 seconds depending on the complexity of your prompt.</p>
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
                  <EditingOverlay
                    image={originalImage}
                    progress={progress}
                    onEdit={handleEdit}
                    onReset={handleReset}
                    isProcessing={true}
                    isMobile={isMobile}
                  />
                </motion.div>
              )}

              {appState === "comparison" && originalImage && editedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle>Edit Complete</CardTitle>
                      <p className="text-muted-foreground">
                        Your image has been successfully edited and saved to your library. Compare the results below.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <EditComparison
                        originalImage={originalImage.dataUrl}
                        editedImage={editedImage}
                        prompt={editPrompt}
                        fileName={originalImage.file.name}
                        onReset={handleReset}
                        onNewEdit={handleNewEdit}
                        isMobile={isMobile}
                      />
                    </CardContent>
                    <div className="flex justify-between py-4 px-6 border-t">
                      <Button variant="outline" onClick={handleReset}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Edit Another Image
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleNewEdit}>
                          New Edit
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