"use client"

import { motion } from "framer-motion"

interface HeroSectionProps {
  isMobile: boolean
}

export function HeroSection({ isMobile }: HeroSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center space-y-4 md:space-y-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
      >
        Restore Your Memories
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-muted-foreground text-base md:text-lg lg:text-xl max-w-[700px] mx-auto leading-relaxed"
      >
        {isMobile
          ? "Transform your old, blurry, or damaged photos using cutting-edge AI technology."
          : "Transform your old, blurry, or damaged photos into crystal-clear masterpieces using cutting-edge AI technology. Preserve your precious moments with professional-grade restoration."}
      </motion.p>
    </motion.div>
  )
}
