"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, History } from "lucide-react"
import type { ImageData } from "@/app/page"

interface ExampleImage {
  src: string
  alt: string
  title: string
}

const exampleImages: ExampleImage[] = [
  {
    src: "https://en-media.thebetterindia.com/uploads/2022/05/History-pictures-3-1652521347-768x402.jpg",
    alt: "Mobile libraries, Free and compulsory primary education in India was introduced for the first time by the state of Baroda in 1906.",
    title: "Mobile libraries (1906)",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b6FXM7Vd2qrYlVEBzBkUFU7uSkBCvV.png",
    alt: "A Snowy Day in Westchester County, New York",
    title: "Snowy Day (1860s)",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6eD01abjM82tTKPpHPPSCaMJWgNzrM.png",
    alt: "A crowd of folks gather around the Glen Mountain House in Watkins Glen, New York",
    title: "Glen Mountain House (1860s)",
  },
]

interface ExampleImagesProps {
  onSelectExample: (imageData: ImageData) => void
  isMobile: boolean
}

export function ExampleImages({ onSelectExample, isMobile }: ExampleImagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? exampleImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === exampleImages.length - 1 ? 0 : prev + 1))
  }

const handleSelectExample = async (image: ExampleImage) => {
  try {
    setIsLoading(true)

   // Add timeout for fetch requests
   const controller = new AbortController()
   const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    // Fetch the image from the blob URL
   const response = await fetch(image.src, { 
     signal: controller.signal,
     mode: 'cors'
   })
   clearTimeout(timeoutId)
   
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const blob = await response.blob()
   
   // Validate that we received an image
   if (!blob.type.startsWith('image/')) {
     throw new Error('Received content is not an image')
   }

    // Create a File object from the blob
    const file = new File([blob], `${image.title.toLowerCase().replace(/\s/g, "-")}.jpg`, {
      type: blob.type || "image/jpeg",
    })

    // Create a data URL from the blob for immediate display
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      onSelectExample({
        file,
        dataUrl,
        source: "upload",
      })
      setIsLoading(false)
    }

    reader.onerror = () => {
      throw new Error("Failed to read image data")
    }

    reader.readAsDataURL(blob)
  } catch (error) {
   console.error("Error loading example image:", error)
   // Show user-friendly error message
   alert("Failed to load example image. Please try another one or upload your own image.")
    setIsLoading(false)
  }
}

  const currentImage = exampleImages[currentIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-medium flex items-center gap-2">
          <History className="h-4 w-4" />
          Try with historical examples
        </h3>
        <p className="text-xs text-muted-foreground">1860s New York</p>
      </div>

      <Card className="overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={currentImage.src || "/placeholder.svg"}
                alt={currentImage.alt}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 md:p-4">
              <p className="text-white text-xs md:text-sm font-medium truncate">{currentImage.title}</p>
              <p className="text-white/80 text-xs truncate">{currentImage.alt}</p>
            </div>

            {exampleImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/80 backdrop-blur-sm h-8 w-8 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/80 backdrop-blur-sm h-8 w-8 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="p-3 md:p-4 flex justify-between items-center">
            <div className="flex gap-1">
              {exampleImages.map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => handleSelectExample(currentImage)}
              className="text-xs"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Use This Example"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
