'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar'

export function NavMainSkeletonClient() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) return null
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full my-1" />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function NavUserSkeletonClient({ open }: { open: boolean }) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) return null
  
  return (
    <div className="space-y-2 p-1">
      <Skeleton className="h-10 w-full" />
      {open && <Skeleton className="h-10 w-full" />}
    </div>
  )
}