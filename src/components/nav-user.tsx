"use client"

import {
  ChevronsUpDown,
  LogOut,
  User,
  UserPlus,
  LogIn,
  Car,
  AlertCircle,
  ClipboardCheck,
  CheckCircle,
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
import { useHydration } from "@/hooks/ui/useHydration"

export function NavUser({ open }: { open: boolean }) {
  //todo ver de tener algun store que maneje mejor esto tanto aca como el layout? osea podemos usar el store de zustand o leer la cookie si existe
  const hydrated = useHydration();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { user: userDb } = useUserStore();

  const { firstName, lastName } = session?.user ? splitFullName(session.user.name || '') : { firstName: '', lastName: '' };
  const email = session?.user?.email;
  const isVerified = userDb?.identityStatus === 'VERIFIED' ? true : false;

  const handleSignOut = async () => {
    if (session) {
      try {
        if (isMobile) {
          setOpenMobile(false);
        }
        await authClient.signOut({
          fetchOptions: {
            onSuccess: async () => {
              router.push("/");
              router.refresh();
              await LoggingService.logActionWithErrorHandling(
                {
                  userId: session.user.id,
                  action: TipoAccionUsuario.CIERRE_SESION,
                  status: 'SUCCESS',
                },
                {
                  fileName: 'nav-user.tsx',
                  functionName: 'handleSignOut'
                }
              );
            },
          },
        });
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  }

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (!hydrated || isPending) {
    return <NavUserSkeletonClient open={open !== undefined ? open : true} />;
  }

  if (!session?.user) {
    return (
      <SidebarMenu className="pb-4">
        <SidebarMenuItem>
          <Button asChild className="w-full" onClick={handleNavigation}>
            <a href="/login">
              <LogIn className="h-4 w-4" />
              <span className={`ml-2 ${!open && !isMobile ? "hidden" : ""}`}>
                Ingresar
              </span>
            </a>
          </Button>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Button asChild variant="outline" className="w-full" onClick={handleNavigation}>
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

  // Contenido para el usuario logueado (ya no está pendiente y está hidratado)
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
                    alt={firstName || ""}
                  />
                  <AvatarFallback className="rounded-lg bg-slate-500 text-white">
                    {firstName?.charAt(0)}
                    {lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute -top-1 -right-1 rounded-full bg-white shadow-sm"
                        style={{ zIndex: 100 }} // Considerar Tailwind z-index class e.g. z-50
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
              {(open || isMobile) && (
                <div className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0 overflow-visible">
                  <div className="flex-1 grid leading-tight w-full">
                    <span className="truncate font-semibold">
                      {firstName} {lastName}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {email}
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
              <div className="flex items-center gap-2 px-1 py-1.5 text-left ">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userDb?.profileImageKey ?? undefined} alt={firstName || ""} />
                  <AvatarFallback className="rounded-lg bg-slate-500 text-white">
                    {firstName?.charAt(0)}
                    {lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{firstName}</span>
                  <span className="truncate text-xs">{email}</span>
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
                <Link href="/perfil" onClick={handleNavigation}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild disabled={true}>
                <Link href="/alertas" onClick={handleNavigation}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Alertas
                </Link>
              </DropdownMenuItem>
              {userDb?.cars.some((car) => car.insurance.status === "VERIFIED") ? <DropdownMenuItem asChild>
                <Link href="/vehiculos" onClick={handleNavigation}>
                  <Car className="mr-2 h-4 w-4" />
                  Vehiculos
                </Link>
              </DropdownMenuItem> : null}
              <DropdownMenuItem asChild disabled={true}>
                <Link href="/reviews">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Reviews
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup> : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}