"use client"

import { Sparkles, Github, Menu, BookMarked, MessageSquareText, LayoutDashboard, LogOut, User, Wand2 } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { ProfileModal } from '@/components/profile-modal'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const pathname = usePathname()
  const isAuthenticated = !!user
useEffect(() => {
   const supabase = createClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_, session) => {
    setUser(session?.user ?? null)
  })
   supabase.auth.getUser().then((res) => {
     if (res.data.user) setUser(res.data.user)
   })
  return () => subscription.unsubscribe()
}, [])



  const isActive = (path: string) => pathname === path

  return (
    <>
      <ProfileModal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
      <header className="border-b border-border/50 sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container flex h-14 md:h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse" />
                <div className="absolute inset-0 h-5 w-5 md:h-6 md:w-6 text-primary/30 animate-ping">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </div>
              <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                RestoreAI
              </span>
            </Link>
            {pathname.startsWith('/app') && (
              <Badge variant="secondary" className="hidden md:flex">User Dashboard</Badge>
            )}
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/edit"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit images with AI</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/rajofearth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visit our GitHub repository</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ModeToggle />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar className="cursor-pointer border-2 hover:border-primary transition-colors">
                      <AvatarImage src={user.user_metadata.avatar_url || user.user_metadata.picture || ''} alt="User avatar" />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setIsProfileModalOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/library">
                      <BookMarked className="mr-2 h-4 w-4" />
                      <span>Library</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = '/'
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:max-w-sm pr-0">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    RestoreAI
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-4">
                  {user && (
                    <div className="flex items-center space-x-4 pb-4 mb-4 border-b">
                      <Avatar>
                        <AvatarImage src={user.user_metadata.avatar_url || user.user_metadata.picture || ''} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Link 
                      href="/edit"
                      className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive('/edit') 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-foreground hover:bg-accent/50 transition-colors'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Wand2 className="h-5 w-5" />
                      <span>Edit Images</span>
                    </Link>

                    {isAuthenticated && (
                      <>
                        <Link 
                          href="/app"
                          className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive('/app') 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-foreground hover:bg-accent/50 transition-colors'}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link 
                          href="/app/library"
                          className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive('/app/library') 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-foreground hover:bg-accent/50 transition-colors'}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <BookMarked className="h-5 w-5" />
                          <span>Library</span>
                        </Link>
                        
                        <button
                          className="flex items-center gap-3 px-3 py-2 text-left rounded-md text-foreground hover:bg-accent/50 transition-colors"
                          onClick={() => { setIsOpen(false); setIsProfileModalOpen(true); }}
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </button>
                      </>
                    )}
                    
                    <a
                      href="https://github.com/teamknull"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-accent/50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Github className="h-5 w-5" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 border-t p-6">
                  {isAuthenticated ? (
                    <Button 
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/auth/login">Sign in</Link>
                    </Button>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
