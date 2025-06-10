"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { LogOut, ImageIcon, UserIcon, Clock } from 'lucide-react'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [user, setUser] = useState<any>(null)
  const [restorations, setRestorations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setLoading(true)
      const supabase = createClient()
      supabase.auth.getUser().then((res) => {
        if (res.data.user) {
          setUser(res.data.user)
          fetch('/api/restore', { method: 'GET' })
            .then((r) => r.json())
            .then((data) => {
              if (data.restorations) setRestorations(data.restorations)
            })
            .finally(() => setLoading(false))
        }
      })
    }
  }, [open])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Calculate latest restoration date
  const latestRestorationDate = restorations.length > 0
    ? new Date(restorations.reduce((latest, current) => 
        latest.created_at > current.created_at ? latest : current
      ).created_at).toLocaleDateString()
    : 'None yet';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <Skeleton className="h-5 w-[250px] mx-auto" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          ) : (
            <>
              <motion.div 
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <img
                    src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-primary/20"
                  />
                  <div className="absolute bottom-0 right-0 bg-background rounded-full p-1 border border-border">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{user?.user_metadata?.full_name || user?.email}</h3>
              </motion.div>
              
              <Separator />
              
              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                <TabsContent value="stats" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Restorations
                        </Badge>
                        <p className="text-3xl font-bold">{restorations.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1">
                          <Clock className="h-4 w-4 mr-2" />
                          Latest
                        </Badge>
                        <p className="text-sm text-muted-foreground">{latestRestorationDate}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="account" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    {user?.user_metadata?.sub && (
                      <div>
                        <p className="text-sm font-medium mb-1">Account ID</p>
                        <p className="text-sm text-muted-foreground truncate">{user.user_metadata.sub}</p>
                      </div>
                    )}
                    <Button 
                      variant="destructive" 
                      onClick={logout} 
                      className="w-full mt-4"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> 
                      Sign Out
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 