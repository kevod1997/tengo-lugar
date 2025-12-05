'use client'

import * as React from "react"

import Image from "next/image"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import type { NavItem } from '@/types/navigation-types';

import { NavUser } from "./nav-user"

export const AppSidebar = React.memo(function AppSidebar({
  initialNavItems,
  initialSession,
  ...props
}: React.ComponentPropsWithoutRef<typeof Sidebar> & { initialNavItems: NavItem[], initialSession: any }) {
  const { open, isMobile, setOpenMobile } = useSidebar()

  const handleLogoClick = () => {
    if (isMobile) {
      setTimeout(() => {
        setOpenMobile(false)
      }, 500)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className={`relative overflow-hidden rounded-full ${open ? 'h-20 w-20' : 'h-8 w-8 mt-2 mb-1'}`}>
            <Link href="/" onClick={handleLogoClick}>
              <Image
                src="/imgs/logo.png"
                alt="Tengo Lugar Logo"
                layout="fill"
                objectFit="cover"
                priority
              />
            </Link>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={initialNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser open={open} initialSession={initialSession} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
})