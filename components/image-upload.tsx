"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Sparkles, X, ImageIcon, Camera, Wand2 } from "lucide-react"
import { CameraCapture } from "@/components/camera-capture"
import type { ImageData } from "@/app/page"

interface ImageUploadProps {
  onImageUpload: (imageData: ImageData) => void
  onRestore?: () => void
  image: ImageData | null
  onReset: () => void
  isMobile: boolean
  isEditMode?: boolean
  mode?: "restore" | "edit"
}

export function ImageUpload({ onImageUpload, onRestore, image, onReset, isMobile, isEditMode = false, mode = "restore" }: ImageUploadProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("upload")

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image under 10MB.",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        onImageUpload({
          file,
          dataUrl: reader.result as string,
          source: "upload",
        })
      }
      reader.readAsDataURL(file)
    },
    [onImageUpload, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  })

  const handleCameraCapture = (imageData: ImageData) => {
    onImageUpload(imageData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardContent className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-primary" />
              {mode === "edit" ? "Upload Image to Edit" : "Restore Your Image"}
            </CardTitle>
            <CardDescription>
              {mode === "edit" 
                ? "Upload any image and transform it with AI-powered editing" 
                : "Upload an old photo and our AI will restore it to look like new"
              }
            </CardDescription>
          </CardHeader>
            <AnimatePresence>
              {image && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button variant="ghost" size="sm" onClick={onReset}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="upload-options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 md:mb-6">
                    <TabsTrigger value="upload" className="flex items-center gap-2 text-sm">
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="camera" className="flex items-center gap-2 text-sm">
                      <Camera className="h-4 w-4" />
                      <span>Camera</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-6 md:p-8 lg:p-12 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive
                          ? "border-primary bg-primary/10 scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-4 md:gap-6">
                        <motion.div
                          className="rounded-full bg-primary/10 p-3 md:p-4"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Upload className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </motion.div>
                        {isDragActive ? (
                          <motion.p
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="text-primary font-medium text-base md:text-lg"
                          >
                            Drop your image here...
                          </motion.p>
                        ) : (
                          <div className="space-y-2 text-center">
                            <p className="text-foreground font-medium text-sm md:text-base lg:text-lg">
                              Drag and drop your image here, or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP (Max 10MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="camera">
                    <CameraCapture onCapture={handleCameraCapture} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-4 md:space-y-6"
              >
                <div
                  className={`relative ${isMobile ? "aspect-[4/3]" : "aspect-video"} w-full overflow-hidden rounded-xl border border-border/50 bg-muted/30`}
                >
                  <img
                    src={image.dataUrl || "/placeholder.svg"}
                    alt="Uploaded image"
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-background/80 backdrop-blur-sm text-xs md:text-sm px-2 md:px-3 py-1 rounded-full border border-border/50">
                    <ImageIcon className="h-3 w-3 md:h-4 md:w-4 inline mr-1 md:mr-2" />
                    Original
                  </div>
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-background/80 backdrop-blur-sm text-xs px-2 md:px-3 py-1 rounded-full border border-border/50">
                    {image.source === "camera" ? "Camera" : "Uploaded"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground truncate">{image.file.name}</p>
                  <p>{(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {image && onRestore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Button
                  className="w-full h-11 md:h-12 text-sm md:text-base lg:text-lg font-medium"
                  onClick={onRestore}
                  size={isMobile ? "default" : "lg"}
                >
                  <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {mode === "edit" ? "Start Editing" : "Restore Image"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
