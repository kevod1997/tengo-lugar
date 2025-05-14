
'use client'

import * as React from "react"
import {
  Car,
  Search,
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
import { authClient } from "@/lib/auth-client"
import { NavMainSkeletonClient, NavUserSkeletonClient } from "./nav-skeleton"
import Link from "next/link"

const authenticatedNavItems = [
  // {
  //   title: "Dashboard",
  //   url: "/dashboard",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Mis Viajes",
    url: "/viajes",
    icon: CarFrontIcon,
  },
  // {
  //   title: "Mis Reservas",
  //   url: "/reservas",
  //   icon: CalendarArrowUp,
  // },
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
    // {
    //   title: "Inicio",
    //   url: "/",
    //   icon: Home,
    //   isActive: true,
    // },
    {
      title: "Buscar",
      url: "/buscar-viaje",
      icon: Search,
    },
    {
      title: "Publicar",
      url: "/publicar-viaje",
      icon: Car,
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

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open, isMobile, setOpenMobile } = useSidebar()
  const { isPending, navItems } = useNavigation()

  // React.useEffect to handle initial client render if needed
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

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
              />
            </Link>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {!isPending && isClient ? <NavMain items={navItems} /> : <NavMainSkeletonClient />}
      </SidebarContent>
      <SidebarFooter>
        {!isPending && isClient ? <NavUser open={open} /> : <NavUserSkeletonClient open={open} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
})