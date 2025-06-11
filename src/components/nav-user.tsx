// // components/nav-user.tsx
"use client"

import {
  ChevronsUpDown,
  LogOut,
  User,
  UserPlus,
  LogIn,
  Car,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUserStore } from "@/store/user-store"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { LoggingService } from "@/services/logging/logging-service"
import { TipoAccionUsuario } from "@/types/actions-logs"
import { splitFullName } from "@/utils/format/user-formatter"
import Link from "next/link"
import { NavUserSkeletonClient } from "./nav-skeleton"
import { useLoadingStore } from "@/store/loadingStore"
import React, { useMemo, useCallback } from "react"

export const NavUser = React.memo(function NavUser({ open, user }: { open: boolean, user: any }) {
  // const [isMounted, setIsMounted] = useState(false)
  const { isLoading, startLoading, stopLoading } = useLoadingStore()
  // const { data: session, isPending } = authClient.useSession()
  const { user: userDb, clearUser } = useUserStore()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()

  // ✅ Estados de loading
  const isSigningOut = isLoading('signingOut')

  // Estados derivados...
  const userInfo = useMemo(() => {
    if (!user) {
      return { firstName: '', lastName: '', email: '', isAdmin: false }
    }

    const { firstName, lastName } = splitFullName(user.name || '')
    return {
      firstName,
      lastName,
      email: user.email || '',
      isAdmin: user.role === 'admin'
    }
  }, [user])

  const isVerified = useMemo(() =>
    userDb?.identityStatus === 'VERIFIED',
    [userDb?.identityStatus]
  )

  const handleSignOut = useCallback(async () => {
    if (!user || isSigningOut) return

    startLoading('signingOut')

    try {
      if (isMobile) {
        setOpenMobile(false)
      }

      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            // ✅ Navegar PRIMERO (esto triggera nueva página con session=null)
            router.push("/")

            // ✅ Limpiar DESPUÉS
            setTimeout(() => {
              clearUser()
            }, 50)

            await LoggingService.logActionWithErrorHandling({
              userId: user.id,
              action: TipoAccionUsuario.CIERRE_SESION,
              status: 'SUCCESS',
            }, {
              fileName: 'nav-user.tsx',
              functionName: 'handleSignOut'
            })
          },
        },
      })
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      stopLoading('signingOut')
    }
  }, [user, isSigningOut, isMobile, clearUser, setOpenMobile, router, startLoading, stopLoading])

  // ✅ Loading states mejorados
  if (user && !userDb) {
    return <NavUserSkeletonClient open={open} />
  }

  // Usuario no autenticado
  if (!user) {
    return (
      <SidebarMenu className="pb-4">
        <SidebarMenuItem>
          <Button asChild className="w-full">
            <a href="/login">
              <LogIn className="h-4 w-4" />
              <span className={`ml-2 ${!open && !isMobile ? "hidden" : ""}`}>
                Ingresar
              </span>
            </a>
          </Button>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Button asChild variant="outline" className="w-full">
            <a href="/crear-cuenta">
              <UserPlus className="h-4 w-4" />
              <span className={`ml-2 ${!open && !isMobile ? "hidden" : ""}`}>
                Crear Cuenta
              </span>
            </a>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Usuario autenticado con datos completos
  return (
    <SidebarMenu className="pb-4">
      <SidebarGroupLabel>Perfil</SidebarGroupLabel>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative z-10 flex items-center w-full gap-3 p-2 overflow-visible"
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={userDb?.profileImageKey ?? undefined}
                    alt={userInfo.firstName}
                  />
                  <AvatarFallback className="rounded-lg bg-slate-500 text-white">
                    {userInfo.firstName.charAt(0)}
                    {userInfo.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute -top-1 -right-1 rounded-full bg-white shadow-sm z-50">
                        {isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isVerified ? "Usuario Verificado" : "Usuario No Verificado"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {(open || isMobile) && (
                <div className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0 overflow-visible">
                  <div className="flex-1 grid leading-tight w-full">
                    <span className="truncate font-semibold">
                      {userInfo.firstName} {userInfo.lastName}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {userInfo.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={userDb?.profileImageKey ?? undefined}
                    alt={userInfo.firstName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {userInfo.firstName.charAt(0)}{userInfo.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userInfo.firstName} {userInfo.lastName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userInfo.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/alertas">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Alertas
                </Link>
              </DropdownMenuItem>

              {userDb?.cars.some((car) => car.insurance.status === 'VERIFIED') && (
                <DropdownMenuItem asChild>
                  <Link href="/vehiculos">
                    <Car className="mr-2 h-4 w-4" />
                    Vehículos
                  </Link>
                </DropdownMenuItem>
              )}
              {userInfo.isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}

            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
})