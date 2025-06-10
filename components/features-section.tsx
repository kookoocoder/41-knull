"use client"

import { motion } from "framer-motion"
import { Upload, Sparkles, Zap, Shield, Palette, Camera } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag and drop or click to upload your images instantly",
  },
  {
    icon: Camera,
    title: "Camera Capture",
    description: "Use your device camera to capture and restore photos on the go",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "AI-powered restoration in seconds, not hours",
  },
  {
    icon: Sparkles,
    title: "AI Enhanced",
    description: "Advanced machine learning for superior quality",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your images are processed securely and never stored",
  },
  {
    icon: Palette,
    title: "Color Perfect",
    description: "Intelligent color correction and enhancement",
  },
]

export function FeaturesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="space-y-8 md:space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold">Why Choose RestoreAI?</h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-[600px] mx-auto">
          Experience the future of image restoration with our cutting-edge AI technology
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            className="group"
          >
            <div className="p-4 md:p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base md:text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
