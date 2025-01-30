"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarChart3, Users, FileText, Settings, Bell, HelpCircle, LayoutDashboard } from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const navItems: NavItem[] = [
  {
    title: "Registros del Sistema",
    href: "/admin/logs",
    icon: FileText,
    description: "Accede a los logs y eventos del sistema"
  },
  {
    title: "Dashboard Detallado",
    href: "/admin/dashboard",
    icon: BarChart3,
    description: "Visualiza estadísticas y gráficos detallados"
  },
  {
    title: "Gestión de Usuarios",
    href: "/admin/users",
    icon: Users,
    description: "Administra cuentas de usuarios y permisos"
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings,
    description: "Configura los parámetros del sistema"
  },
  {
    title: "Notificaciones",
    href: "/admin/notifications",
    icon: Bell,
    description: "Gestiona las notificaciones del sistema"
  },
]

export function AdminNav() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="outline"
          className={cn(
            "h-auto w-full justify-start gap-2 p-4",
            "hover:bg-accent hover:text-accent-foreground"
          )}
          asChild
        >
          <a href={item.href}>
            <item.icon className="h-5 w-5 shrink-0" />
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">{item.title}</span>
              <span className="text-sm text-muted-foreground">
                {item.description}
              </span>
            </div>
          </a>
        </Button>
      ))}
    </div>
  )
}

