"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Zap } from "lucide-react"
import type { ImageData } from "@/app/page"

interface RestorationOverlayProps {
  image: ImageData
  progress: number
}

export function RestorationOverlay({ image, progress }: RestorationOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold"
        >
          Restoring Your Image
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-lg"
        >
          Our AI is working its magic on your photo...
        </motion.p>
      </div>

      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardContent className="p-0 relative">
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={image.dataUrl || "/placeholder.svg"}
              alt="Processing image"
              className="h-full w-full object-contain"
            />

            {/* Animated overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            </motion.div>

            {/* Processing indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-background/90 backdrop-blur-md rounded-2xl p-8 border border-border/50 shadow-2xl"
              >
                <div className="flex flex-col items-center space-y-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="relative"
                  >
                    <Sparkles className="h-12 w-12 text-primary" />
                    <motion.div
                      className="absolute inset-0"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Zap className="h-12 w-12 text-primary/50" />
                    </motion.div>
                  </motion.div>

                  <div className="text-center space-y-3 min-w-[200px]">
                    <p className="font-semibold text-lg">Processing...</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-mono">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
