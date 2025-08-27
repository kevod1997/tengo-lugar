'use client'

import React, { useState, useEffect } from 'react'
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
import { toast } from 'sonner'

interface NotificationButtonProps {
  className?: string
}

export function NotificationButton({ className = '' }: NotificationButtonProps) {
  const { isConnected, isConnecting, service } = useWebSocket()
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refetchNotifications
  } = useNotifications()
  const [open, setOpen] = useState(false)

  const hasUnreadNotifications = unreadCount > 0

  // Track notifications for WebSocket message handling
  const notificationCount = notifications.length

  // Listen for WebSocket notification messages
  useEffect(() => {
    const handleMessage = async (data: any) => {
      // Check if this is a notification message from WebSocket server
      if (data.type === 'notification' && data.payload) {
        const currentCount = notificationCount
        
        // Refetch notifications from database
        const result = await refetchNotifications()
        
        // Check if we have new notifications
        const newNotifications = result.data || []
        if (newNotifications.length > currentCount) {
          const latestNotifications = newNotifications.slice(0, newNotifications.length - currentCount)
          
          // Show toast for each new notification
          latestNotifications.forEach(notification => {
            toast.success(`${notification.title}: ${notification.message}`)
          })
        }
      }
    }

    // Add WebSocket message listener
    service.on('message', handleMessage)

    // Cleanup listener on unmount
    return () => {
      service.off('message', handleMessage)
    }
  }, [service, refetchNotifications, notificationCount])

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleNotificationClick = (notification: any) => {
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
                  className={`p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground border-l-2 ${
                    !notification.read 
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
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay notificaciones</p>
              {!isConnected && (
                <p className="text-xs mt-1">
                  WebSocket desconectado
                </p>
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