'use client'

import React, { useState } from 'react'
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
    markAsRead,
    markAllAsRead
  } = useNotifications()
  const [open, setOpen] = useState(false)

  const hasUnreadNotifications = unreadCount > 0

  // Don't render the component if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleNotificationClick = (notification: any) => {
    // Don't execute if notification is already read
    if (notification.read) return

    markAsRead(notification.id)

    // Navigate to link if available
    if (notification.link) {
      window.open(notification.link, '_blank')
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
                  className={`p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground border-l-2 ${!notification.read
                      ? 'border-l-primary bg-primary/5'
                      : 'border-l-transparent'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-medium text-sm ${!notification.read ? 'text-primary' : ''}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {new Date(notification.createdAt).toLocaleTimeString()}
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
            <div className="p-2 space-y-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}