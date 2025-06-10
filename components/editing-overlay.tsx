"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Wand2, RotateCcw, Loader2, Sparkles } from "lucide-react"
import type { ImageData } from "@/app/edit/page"

interface EditingOverlayProps {
  image: ImageData
  progress: number
  onEdit: (prompt: string) => void
  onReset: () => void
  isProcessing: boolean
  isMobile: boolean
}

export function EditingOverlay({ image, progress, onEdit, onReset, isProcessing, isMobile }: EditingOverlayProps) {
  const [prompt, setPrompt] = useState("")

  const handleEdit = () => {
    if (prompt.trim()) {
      onEdit(prompt.trim())
    }
  }

  const examplePrompts = [
    "Make it look like a vintage photograph",
    "Add a dreamy, ethereal glow",
    "Transform into a watercolor painting",
    "Add dramatic lighting and shadows",
    "Make it look like it's underwater",
    "Convert to black and white with high contrast",
    "Add autumn colors and falling leaves",
    "Make it look futuristic and sci-fi"
  ]

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
          {isProcessing ? "Editing in Progress" : "Edit Your Image"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm md:text-base lg:text-lg px-4"
        >
          {isProcessing 
            ? "AI is applying your edits to the image. This may take a few moments..." 
            : "Describe how you want to transform your image using natural language"
          }
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Image Preview */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Original Image</h3>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border/50">
              <img
                src={image.dataUrl}
                alt="Original image to edit"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>

        {/* Edit Controls */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-lg font-semibold">
                Edit Prompt
              </Label>
              <Textarea
                id="prompt"
                placeholder="Describe how you want to edit your image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isProcessing}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">
                {prompt.length}/500 characters
              </div>
            </div>

            {/* Example Prompts */}
            {!isProcessing && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Example prompts:
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {examplePrompts.slice(0, isMobile ? 4 : 6).map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3 text-xs"
                      onClick={() => setPrompt(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Processing...</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>AI is analyzing and editing your image</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleEdit}
                disabled={!prompt.trim() || isProcessing}
                className="flex-1"
                size={isMobile ? "sm" : "default"}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Editing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Edit Image
                  </>
                )}
              </Button>
              
              <Button
                onClick={onReset}
                variant="outline"
                disabled={isProcessing}
                size={isMobile ? "sm" : "default"}
              >
                {isMobile ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
} 