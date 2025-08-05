// components/MobileBottomNavigationClient.tsx ('use client' solo para interactividad)
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { User, CarFrontIcon, MessageSquare, Search, PlusCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/buscar-viaje', icon: Search, label: 'Buscar' },
  { href: '/publicar-viaje', icon: PlusCircleIcon, label: 'Publicar' },
  { href: '/viajes', icon: CarFrontIcon, label: 'Mis Viajes' },
  { href: '/mensajes', icon: MessageSquare, label: 'Mensajes' },
  { href: '/perfil', icon: User, label: 'Perfil' }
]

export function MobileBottomNavigationClient() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
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
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className={cn("text-xs font-medium leading-none", active && "text-primary")}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}