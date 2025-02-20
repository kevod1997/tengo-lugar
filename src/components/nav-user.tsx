"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import {
  ChevronsUpDown,
  LogOut,
  User,
  UserPlus,
  LogIn,
  Car,
  AlertCircle,
  Paperclip,
  ClipboardCheck,
  CheckCircle,
  XCircle,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUserStore } from "@/store/user-store"

export function NavUser({ open }: { open: boolean }) {
  const { signOut } = useClerk()
  const { user, isSignedIn } = useUser()
  const { isMobile } = useSidebar()
  const { user: userDb } = useUserStore()
  const isVerified = userDb?.identityStatus === 'VERIFIED' ? true : false
  if (!isSignedIn) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Button asChild variant="outline" className="w-full">
            <a href="/registro">
              <UserPlus className="h-4 w-4" />
              {open && <span className="ml-2">Registrarse</span>}
            </a>
          </Button>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Button asChild className="w-full">
            <a href="/login">
              <LogIn className="h-4 w-4" />
              {open && <span className="ml-2">Iniciar Sesión</span>}
            </a>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative z-10 flex items-center w-full gap-3 p-2 overflow-visible"
            >
              {/* Container del Avatar y badge */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={userDb?.profileImageKey ?? undefined}
                    alt={userDb?.firstName || ""}
                  />
                  <AvatarFallback className="rounded-lg bg-slate-500 text-white">
                    {userDb?.firstName?.charAt(0)}
                    {userDb?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Badge de verificación con z-index más alto */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute -top-1 -right-1 rounded-full bg-white shadow-sm"
                        style={{ zIndex: 100 }}
                      >
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

              {/* Información del usuario con mejor manejo de espacio */}
              {/* {open && (
                <div className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0">
                  <div className="flex-1 grid text-xs sm:text-sm leading-tight w-full">
                    <span className="truncate font-semibold">
                      {userDb?.firstName} {userDb?.lastName}
                    </span>
                    <span className="truncate text-[10px] sm:text-xs text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </div>
              )} */}
              {open && (
                <div className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0 overflow-visible">
                  <div className="flex-1 grid text-xs sm:text-sm leading-tight w-full">
                    <span className="truncate font-semibold">
                      {userDb?.firstName} {userDb?.lastName}
                    </span>
                    <span className="truncate text-[10px] sm:text-xs text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </div>
              )}
            </SidebarMenuButton>

          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userDb?.profileImageKey ?? undefined} alt={userDb?.firstName || ""} />
                  <AvatarFallback className="rounded-lg bg-slate-500 text-white">
                    {userDb?.firstName?.charAt(0)}
                    {userDb?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userDb?.firstName}</span>
                  <span className="truncate text-xs">{userDb?.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {isVerified ? "Usuario Verificado" : "Usuario No Verificado"}
                  </span>
                </div>
                {isVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userDb ? <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Editar Perfil
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/alertas">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Alertas
                </a>
              </DropdownMenuItem>
              {userDb?.cars.some((car) => car.insurance.status === "VERIFIED") ? <DropdownMenuItem asChild>
                <a href="/vehiculos">
                  <Car className="mr-2 h-4 w-4" />
                  Vehiculos
                </a>
              </DropdownMenuItem> : null}
              <DropdownMenuItem asChild>
                <a href="/reviews">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Reviews
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup> : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}