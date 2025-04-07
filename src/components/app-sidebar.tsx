"use client"

import * as React from "react"
import {
  Bell,
  Car,
  Home,
  Search,
  LayoutDashboard,
  CarFrontIcon,
  UserIcon,
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
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"

// const authenticatedNavItems = [
//   {
//     title: "Dashboard",
//     url: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     title: "Viajes",
//     url: "/viajes",
//     icon: CarFrontIcon,
//     items: [
//       {
//         title: "Viajes Finalizados",
//         url: "#",
//       },
//       {
//         title: "Proximos viajes",
//         url: "#",
//       },
//     ]
//   },
//   {
//     title: "Notificaciones",
//     url: "/notificaciones",
//     icon: Bell,
//   },
// ]

const authenticatedNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mis Viajes",
    url: "/viajes",
    icon: CarFrontIcon,
    // items: [
    //   {
    //     title: "Viajes Finalizados",
    //     url: "#",
    //   },
    //   {
    //     title: "Proximos viajes",
    //     url: "#",
    //   },
    // ]
  },
  {
    title: "Notificaciones",
    url: "/notificaciones",
    icon: Bell,
  },
]

const authethicatedNavItems = [
  {
    title: "Admin",
    url: "/admin",
    icon: UserIcon,
  }
]

const navData = {
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
  ],
}

function useNavigation() {

  const { data, isPending } = authClient.useSession()
  const isSignedIn = data
  const userIsAuthenticated = data?.user?.role === "admin"

  return React.useMemo(() => ({
    isPending,
    navItems: isSignedIn && userIsAuthenticated
      ? [...navData.navMain, ...authenticatedNavItems, ...authethicatedNavItems] : isSignedIn ? [...navData.navMain, ...authenticatedNavItems]
        : navData.navMain
  }), [isSignedIn, userIsAuthenticated, isPending])
}

function NavMainSkeleton() {
  return (
    <div className="space-y-2 p-1">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full bg-fuchsia-100" />
      ))}
    </div>
  )
}

function NavUserSkeleton({ open }: { open: boolean }) {
  return (
    <div className="space-y-2 p-1">
      <Skeleton className="h-10 w-full bg-fuchsia-100" />
      {open && <Skeleton className="h-10 w-full bg-fuchsia-100" />}
    </div>
  )
}

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  const { isPending, navItems } = useNavigation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className={`relative overflow-hidden rounded-full ${open ? 'h-24 w-24' : 'h-8 w-8 mt-6 mb-1'}`}>
            <Image
              src="/imgs/logo.png"
              alt="Tengo Lugar Logo"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {!isPending ? <NavMain items={navItems} /> : <NavMainSkeleton />}
      </SidebarContent>
      <SidebarFooter>
        {!isPending ? <NavUser open={open} /> : <NavUserSkeleton open={open} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
})

