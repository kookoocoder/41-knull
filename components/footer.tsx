"use client"

import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 md:py-8 mt-12 md:mt-16">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs md:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RestoreAI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3 w-3 md:h-4 md:w-4 text-red-500 fill-current" />
            <span>by</span>
            <span className="font-semibold text-foreground">Team Knull</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
