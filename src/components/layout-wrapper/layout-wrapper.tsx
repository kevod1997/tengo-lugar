'use client'

import React from 'react'
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()

  return (
    <div className={`flex flex-col flex-1 w-full ${open ? 'lg:ml-64' : 'lg:ml-16'}`}>
      {children}
    </div>
  )
}