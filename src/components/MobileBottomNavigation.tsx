'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Search, MessageCircle, User, PlusCircleIcon, CarFrontIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  requiresAuth: boolean
}

const navItems: NavItem[] = [
  {
    href: '/buscar-viaje',
    icon: Search,
    label: 'Buscar',
    requiresAuth: false
  },
  {
    href: '/',
    icon: PlusCircleIcon,
    label: 'Publicar',
    requiresAuth: true
  },
  {
    href: '/viajes',
    icon: CarFrontIcon,
    label: 'Mis Viajes',
    requiresAuth: true
  },
  {
    href: '/chats',
    icon: MessageCircle,
    label: 'Mensajes',
    requiresAuth: true
  },
  {
    href: '/perfil',
    icon: User,
    label: 'Perfil',
    requiresAuth: true
  }
]

export function MobileBottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data } = authClient.useSession()

  const handleNavigation = (item: NavItem) => {
    if (item.requiresAuth && !data?.user) {
      router.push(`/login?redirect_url=${encodeURIComponent(item.href)}`)
      return
    }

    router.push(item.href)
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  active && "text-primary"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium leading-none",
                  active && "text-primary"
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}