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
import { NavUserDynamic } from "./nav-user-dynamic"

export const AppSidebar = React.memo(function AppSidebar({
  initialNavItems,
  ...props
}: React.ComponentPropsWithoutRef<typeof Sidebar> & { initialNavItems: NavItem[] }) {
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
          <div className={`relative overflow-hidden rounded-full ${open ? 'h-24 w-24' : 'h-8 w-8 mt-6 mb-1'}`}>
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
        <NavUserDynamic open={open} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
})