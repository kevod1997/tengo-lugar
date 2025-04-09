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
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: string
  link?: string
}

interface NotificationButtonProps {
  unreadCount?: number
  notifications?: Notification[]
  onViewAll?: () => void
  onReadAll?: () => void
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Actualiza tu perfil',
    message: 'Para mejorar tus posibilidades de encontrar viajes, completa tu información personal',
    read: false,
    timestamp: 'Hace 5 min',
    link: '/perfil'
  },
  // other notifications...
];

export function NotificationButton({ 
  unreadCount = 0,
  notifications = [], 
  onViewAll,
  onReadAll 
}: NotificationButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([])
  const [localUnreadCount, setLocalUnreadCount] = useState(0)
  
  // Initialize local state once on mount
  useEffect(() => {
    const dataToUse = notifications.length > 0 ? notifications : mockNotifications;
    setLocalNotifications(dataToUse);
    
    const count = unreadCount > 0 
      ? unreadCount 
      : dataToUse.filter(n => !n.read).length;
    setLocalUnreadCount(count);
  }, [notifications, unreadCount]);
  
  // Update local state when props change
  useEffect(() => {
    if (notifications.length > 0) {
      setLocalNotifications(notifications);
    }
    
    if (unreadCount !== undefined) {
      setLocalUnreadCount(unreadCount);
    }
  }, [notifications, unreadCount]);

  const handleViewAll = () => {
    setOpen(false);
    onViewAll?.();
  }

  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  }
  
  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);
    
    // When opening the dropdown and there are unread notifications
    if (newOpenState && localUnreadCount > 0) {
      // Clear unread count immediately in local state
      setLocalUnreadCount(0);
      
      // Mark all notifications as read
      setLocalNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Notify parent component
      onReadAll?.();
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          {localUnreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {localUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-xs"
            >
              {localUnreadCount > 9 ? '9+' : localUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {localNotifications.length > 0 ? (
            localNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="py-3 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-muted-foreground">
              No tienes notificaciones
            </div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div 
          className="py-2 px-2 text-center font-medium text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
          onClick={handleViewAll}
        >
          Ver todas las notificaciones
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}