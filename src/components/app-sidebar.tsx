"use client"

import * as React from "react"
import {
  Bell,
  Car,
  Home,
  Search,
  Map,
  LayoutDashboard,
  CarFrontIcon,
} from "lucide-react"
import Image from "next/image"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Publicar Viaje",
      url: "/publicar-viaje",
      icon: Car,
    },
    {
      title: "Buscar Viaje",
      url: "/buscar-viaje",
      icon: Search,
    },
    {
      title: "Simular Viaje",
      url: "/simular-viaje",
      icon: Map,
    },
  ],
}

function NavMainSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

function NavUserSkeleton({ open }: { open: boolean }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {open && <Skeleton className="h-10 w-full" />}
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  const { isSignedIn, isLoaded } = useAuth()

  const authenticatedNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Viajes",
      url: "/viajes",
      icon: CarFrontIcon,
      items: [
        {
          title: "Viajes Finalizados",
          url: "#",
        },
        {
          title: "Proximos viajes",
          url: "#",
        },
      ]
    },
    {
      title: "Notificaciones",
      url: "/notificaciones",
      icon: Bell,
    },
  ]

  const navItems = isSignedIn
    ? [...data.navMain, ...authenticatedNavItems]
    : data.navMain

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className={`relative overflow-hidden rounded-full ${
            open? 'h-48 w-48' : 'h-16 w-16'}`}>
            <Image
              src="/imgs/logo.svg"
              alt="Tengo Lugar Logo"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isLoaded ? <NavMain items={navItems} /> : <NavMainSkeleton />}
      </SidebarContent>
      <SidebarFooter>
        {isLoaded ? <NavUser open={open} /> : <NavUserSkeleton open={open} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}