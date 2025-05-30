
// 'use client'

// import * as React from "react"
// import {
//   Search,
//   CarFrontIcon,
//   PlusCircleIcon,
// } from "lucide-react"
// import Image from "next/image"
// import { NavMain } from "@/components/nav-main"
// import { NavUser } from "@/components/nav-user"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarRail,
//   useSidebar,
// } from "@/components/ui/sidebar"
// import { authClient } from "@/lib/auth-client"
// import { NavMainSkeletonClient, NavUserSkeletonClient } from "./nav-skeleton"
// import Link from "next/link"

// const authenticatedNavItems = [
//   {
//     title: "Mis Viajes",
//     url: "/viajes",
//     icon: CarFrontIcon,
//   },
//   {
//     title: "Mensajes",
//     url: "/mensajes",

//   }
// ]


// const navData = {
//   navMain: [
//     {
//       title: "Buscar",
//       url: "/buscar-viaje",
//       icon: Search,
//     },
//     {
//       title: "Publicar",
//       url: "/publicar-viaje",
//       icon: PlusCircleIcon,
//     },
//   ],
// }

// function useNavigation() {

//   const { data, isPending } = authClient.useSession()
//   const isSignedIn = data

//   return React.useMemo(() => ({
//     isPending,
//     navItems: isSignedIn
//       ? [...navData.navMain, ...authenticatedNavItems] : navData.navMain
//   }), [isSignedIn, isPending])
// }

// export const AppSidebar = React.memo(function AppSidebar({
//   ...props
// }: React.ComponentProps<typeof Sidebar>) {
//   const { open, isMobile, setOpenMobile } = useSidebar()
//   const { isPending, navItems } = useNavigation()

//   // React.useEffect to handle initial client render if needed
//   const [isClient, setIsClient] = React.useState(false)

//   React.useEffect(() => {
//     setIsClient(true)
//   }, [])

//   const handleLogoClick = () => {
//     if (isMobile) {
//       setTimeout(() => {
//         setOpenMobile(false)
//       }, 500)
//     }
//   }


//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader className="flex items-center justify-center">
//         <div className="flex items-center space-x-2">
//           <div className={`relative overflow-hidden rounded-full ${open ? 'h-24 w-24' : 'h-8 w-8 mt-6 mb-1'}`}>
//             <Link href="/" onClick={handleLogoClick}>
//               <Image
//                 src="/imgs/logo.png"
//                 alt="Tengo Lugar Logo"
//                 layout="fill"
//                 objectFit="cover"
//               />
//             </Link>
//           </div>
//         </div>
//       </SidebarHeader>
//       <SidebarContent>
//         {!isPending && isClient ? <NavMain items={navItems} /> : <NavMainSkeletonClient />}
//       </SidebarContent>
//       <SidebarFooter>
//         {!isPending && isClient ? <NavUser open={open} /> : <NavUserSkeletonClient open={open} />}
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar >
//   )
// })

// src/components/app-sidebar.tsx
'use client'

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
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
import { NavMainSkeletonClient } from "./nav-skeleton"
import type { NavItem } from '@/types/navigation-types';
export const AppSidebar = React.memo(function AppSidebar({
  initialNavItems,
  ...props
}: React.ComponentPropsWithoutRef<typeof Sidebar> & { initialNavItems: NavItem[] }) { // Use SidebarProps and ensure NavItem is the updated one
  const { open, isMobile, setOpenMobile } = useSidebar()

  const [isClient, setIsClient] = React.useState(false)
  console.log('[AppSidebar] Render - isClient:', isClient, 'Time:', new Date().toLocaleTimeString());
  // React.useEffect(() => {
  //   setIsClient(true)
  // }, [])
  React.useEffect(() => {
    console.log('[AppSidebar] useEffect - Setting isClient to true. Time:', new Date().toLocaleTimeString());
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
                priority
              />
            </Link>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isClient ? (
          <NavMain items={initialNavItems} />
        ) : (
          <>
            <NavMainSkeletonClient />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser open={open} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
})