"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RotateCcw, Wand2, Share2, Copy, Check, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface EditComparisonProps {
  originalImage: string
  editedImage: string
  fileName: string
  prompt: string
  onReset: () => void
  onNewEdit: () => void
  isMobile: boolean
}

export function EditComparison({ 
  originalImage, 
  editedImage, 
  fileName, 
  prompt, 
  onReset, 
  onNewEdit, 
  isMobile 
}: EditComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }, [])

  const handleTouchStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPosition(percentage)
    },
    [isDragging],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return

      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPosition(percentage)
    },
    [isDragging],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = editedImage
    link.download = `edited_${fileName}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your edited image is being downloaded.",
    })
  }

  const handleNativeShare = async () => {
    if ('share' in navigator) {
      try {
        // Convert the image URL to a blob for sharing
        const response = await fetch(editedImage)
        const blob = await response.blob()
        const file = new File([blob], `edited_${fileName}`, { type: blob.type })

        await navigator.share({
          title: "Edited Image - RestoreAI",
          text: `Check out my edited image from RestoreAI! Prompt: "${prompt}"`,
          files: [file],
        })

        toast({
          title: "Shared successfully",
          description: "Your edited image has been shared.",
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error)
          toast({
            variant: "destructive",
            title: "Sharing failed",
            description: "Could not share the image. Try downloading instead.",
          })
        }
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      // Create a temporary URL for the image
      const response = await fetch(editedImage)
      const blob = await response.blob()

      // For modern browsers that support clipboard API with images
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type]: blob })
        await navigator.clipboard.write([item])

        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Image copied",
          description: "The edited image has been copied to your clipboard.",
        })
      } else {
        // Fallback: copy the data URL as text
        await navigator.clipboard.writeText(editedImage)

        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Link copied",
          description: "The image link has been copied to your clipboard.",
        })
      }
    } catch (error) {
      console.error("Error copying:", error)
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy the image. Try downloading instead.",
      })
    }
  }

  const handleSaveAs = () => {
    // Create a temporary link with a different filename
    const link = document.createElement("a")
    link.href = editedImage
    link.download = `edited_${Date.now()}_${fileName}`

    // Trigger the download with a custom filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Save as started",
      description: "Choose where to save your edited image.",
    })
  }

  // Add event listeners for touch events
  useEffect(() => {
    const handleGlobalTouchEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener("touchend", handleGlobalTouchEnd)
    return () => {
      document.removeEventListener("touchend", handleGlobalTouchEnd)
    }
  }, [])

  // Determine the aspect ratio for mobile optimization
  const aspectRatio = isMobile ? "aspect-[4/3]" : "aspect-video"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center space-y-3 md:space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold"
        >
          Edit Complete
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm md:text-base lg:text-lg px-4"
        >
          {isMobile ? "Slide to compare" : "Drag the slider to compare"} your original and edited images
        </motion.p>
      </div>

      {/* Prompt Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm inline-block">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Applied edit:</span>
              <Badge variant="secondary" className="font-normal">
                "{prompt}"
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
            <h2 className="text-lg md:text-xl font-semibold">Before & After</h2>
            <div className="flex gap-1 md:gap-2">
              <Button onClick={onNewEdit} size={isMobile ? "sm" : "default"} className="text-xs md:text-sm">
                <Wand2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {isMobile ? "" : "Edit Again"}
              </Button>

              <Button onClick={handleDownload} size={isMobile ? "sm" : "default"} className="text-xs md:text-sm">
                <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {isMobile ? "" : "Download"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size={isMobile ? "sm" : "default"} className="text-xs md:text-sm">
                    <Share2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    {isMobile ? "" : "Share"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {'share' in navigator && (
                    <>
                      <DropdownMenuItem onClick={handleNativeShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share via system
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleCopyLink}>
                    {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAs}>
                    <Download className="mr-2 h-4 w-4" />
                    Save as...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={onReset} variant="outline" size={isMobile ? "sm" : "default"}>
                {isMobile ? (
                  <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    New Image
                  </>
                )}
              </Button>
            </div>
          </div>

          <div
            className={`relative ${aspectRatio} w-full overflow-hidden rounded-lg md:rounded-xl border border-border/50 bg-muted cursor-ew-resize select-none touch-none`}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Edited image (background) */}
            <img
              src={editedImage || "/placeholder.svg"}
              alt="Edited"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />

            {/* Original image (foreground with clip) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={originalImage || "/placeholder.svg"}
                alt="Original"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>

            {/* Slider handle */}
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 md:w-1 bg-white shadow-lg cursor-ew-resize z-10 flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-primary/20">
                <div className="w-0.5 h-3 md:w-1 md:h-4 bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-3 md:w-1 md:h-4 bg-gray-400 rounded-full ml-0.5 md:ml-1"></div>
              </div>
            </motion.div>

            {/* Labels */}
            <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-background/80 backdrop-blur-sm text-xs md:text-sm px-2 md:px-3 py-1 rounded-full border border-border/50">
              Original
            </div>
            <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-primary/80 backdrop-blur-sm text-xs md:text-sm px-2 md:px-3 py-1 rounded-full text-primary-foreground border border-primary/50">
              <Wand2 className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
              Edited
            </div>

            {/* Slider position indicator */}
            <div className="absolute bottom-2 md:bottom-3 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full border border-border/50">
              {Math.round(sliderPosition)}% edited
            </div>
          </div>

          {/* Mobile-specific quick actions */}
          {isMobile && (
            <div className="flex gap-2 pt-2">
              <Button onClick={onNewEdit} variant="outline" className="flex-1 text-xs">
                <Wand2 className="mr-2 h-3 w-3" />
                Edit Again
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1 text-xs">
                <Download className="mr-2 h-3 w-3" />
                Download
              </Button>
              {'share' in navigator ? (
                <Button onClick={handleNativeShare} variant="outline" className="flex-1 text-xs">
                  <Share2 className="mr-2 h-3 w-3" />
                  Share
                </Button>
              ) : (
                <Button onClick={handleCopyLink} variant="outline" className="flex-1 text-xs">
                  {copied ? <Check className="mr-2 h-3 w-3 text-green-500" /> : <Copy className="mr-2 h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 