'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useWebSocket } from '@/hooks/websocket/useWebSocket'
import { useNotifications } from '@/hooks/notifications/useNotifications'
import { useAuth } from '@/components/providers/AuthSessionProvider'

interface NotificationButtonProps {
  className?: string
}

export function NotificationButton({ className = '' }: NotificationButtonProps) {
  const { isAuthenticated } = useAuth()
  const { isConnected, isConnecting } = useWebSocket()
  const {
    notifications,
    unreadCount,
    markAllAsRead
  } = useNotifications()
  const [open, setOpen] = useState(false)
  const autoMarkTimer = useRef<NodeJS.Timeout | null>(null)

  const hasUnreadNotifications = unreadCount > 0

  // Format notification time/date based on when it was created
  const formatNotificationTime = (createdAt: string | Date) => {
    const createdAtStr = typeof createdAt === 'string' ? createdAt : createdAt.toISOString()
    const notificationDate = new Date(createdAtStr)
    const now = new Date()

    // Check if it's the same day
    const isSameDay = notificationDate.toDateString() === now.toDateString()

    if (isSameDay) {
      // Same day: show time
      return notificationDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      // Different day: show date (DD/MM)
      return notificationDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      })
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoMarkTimer.current) {
        clearTimeout(autoMarkTimer.current)
      }
    }
  }, [])

  // Don't render the component if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleNotificationClick = (notification: any) => {
    // Only handle click if notification has a link
    if (notification.link) {
      const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://localhost:3000'

      // Check if it's already a complete URL or a relative path
      const fullUrl = notification.link.startsWith('http')
        ? notification.link
        : `${baseUrl}${notification.link}`

      // Determine if it's an internal or external link
      const isExternalLink = notification.link.startsWith('http') && !notification.link.includes(baseUrl)

      // Navigate accordingly
      if (isExternalLink) {
        // External link - open in new window
        window.open(fullUrl, '_blank')
      } else {
        // Internal link - navigate in same window
        window.open(fullUrl, '_self')
      }

      setOpen(false) // Close dropdown after navigation
    }
  }

  const getIconColor = () => {
    if (isConnecting) return 'text-muted-foreground animate-pulse'
    if (isConnected) return hasUnreadNotifications ? 'text-primary' : 'text-muted-foreground'
    return 'text-muted-foreground'
  }

  // Prevent opening dropdown when connecting or when no notifications
  const canOpenDropdown = isConnected && (notifications.length > 0 || !isConnecting)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !canOpenDropdown) return

    setOpen(newOpen)

    // Auto-mark all notifications as read after 1 second when opening
    if (newOpen && hasUnreadNotifications) {
      autoMarkTimer.current = setTimeout(() => {
        markAllAsRead()
      }, 500)
    }

    // Clear timer if closing before delay
    if (!newOpen && autoMarkTimer.current) {
      clearTimeout(autoMarkTimer.current)
      autoMarkTimer.current = null
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={!isConnected && !isConnecting}
          className={`relative ${className}`}
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          {hasUnreadNotifications ? (
            <BellRing className={`h-5 w-5 ${getIconColor()}`} />
          ) : (
            <Bell className={`h-5 w-5 ${getIconColor()}`} />
          )}

          {/* Badge de contador de notificaciones */}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-h-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="max-h-64 overflow-y-auto">
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 ${notification.link ? 'cursor-pointer' : 'cursor-default'} hover:bg-accent hover:text-accent-foreground border-l-2 transition-all duration-500 ease-in-out ${!notification.read
                      ? 'border-l-primary bg-primary/5'
                      : 'border-l-transparent'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-medium text-sm transition-colors duration-500 ease-in-out ${!notification.read ? 'text-primary' : ''}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {isConnecting ? (
                <>
                  <div className="flex justify-center mb-2">
                    <Bell className="h-8 w-8 opacity-50 animate-pulse" />
                  </div>
                  <p className="text-sm">Conectando...</p>
                  <p className="text-xs mt-1 opacity-75">
                    Estableciendo conexión con el servidor
                  </p>
                </>
              ) : (
                <>
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                  {!isConnected && (
                    <p className="text-xs mt-1">
                      Error con la conexión. Intenta recargar la página.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </DropdownMenuGroup>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000'
                  window.open(`${baseUrl}/notificaciones`, '_self')
                  setOpen(false)
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}