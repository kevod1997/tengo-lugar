'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
// import { NotificationButton } from '../notification/NotificationButton'

type BreadcrumbItem = {
  label: string
  href?: string
}

interface HeaderProps {
  breadcrumbs: BreadcrumbItem[]
  className?: string
  showBackButton?: boolean
  isSticky?: boolean
  notifications?: any[] // You should define a proper type for notifications
  unreadCount?: number
}

// Mock notifications for testing - you can remove this in production
// const mockNotifications = [
//   {
//     id: '1',
//     title: 'Actualiza tu perfil',
//     message: 'Para mejorar tus posibilidades de encontrar viajes, completa tu información personal',
//     read: false,
//     timestamp: 'Hace 5 min',
//     link: '/perfil'
//   },
//   {
//     id: '2',
//     title: 'Nuevo viaje disponible',
//     message: 'Se ha publicado un nuevo viaje que coincide con tus preferencias',
//     read: false,
//     timestamp: 'Hace 30 min',
//     link: '/buscar-viaje'
//   }
// ];

export default function Header({ 
  breadcrumbs, 
  className = '', 
  showBackButton = true,
  isSticky = true,
  // notifications = mockNotifications, // Use mock by default for testing
  // unreadCount = 2 // Set default value to match mock data
}: HeaderProps) {
  const router = useRouter()
  // const [calculatedUnreadCount, setCalculatedUnreadCount] = useState(unreadCount)

  // // Calculate unread count if not provided directly
  // useEffect(() => {
  //   if (unreadCount === 0 && notifications.length > 0) {
  //     const count = notifications.filter(n => !n.read).length
  //     setCalculatedUnreadCount(count)
  //   } else {
  //     setCalculatedUnreadCount(unreadCount)
  //   }
  // }, [notifications, unreadCount])

  const handleGoBack = () => {
    router.back()
  }

  // const handleViewAllNotifications = () => {
  //   router.push('/notificaciones')
  // }

  // const handleReadAllNotifications = () => {
  //   setCalculatedUnreadCount(0)
  //   // If you're storing the actual notifications in state, you would also 
  //   // update them to mark them as read here
  // }

  const stickyClasses = isSticky 
    ? 'sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90' 
    : '';

  return (
    <div className={`${stickyClasses}`}>
      <header className={`mt-3 mb-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {showBackButton && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGoBack}
                  className="mr-2"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Separator color='black' orientation="vertical" className="mr-2 h-4" />
              </>
            )}
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className='text-xl font-semibold'>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink className='text-xl hover:font-semibold' href={item.href || '#'}>{item.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Header actions area */}
          {/* <div className="mr-1 flex items-center gap-2">
            <NotificationButton 
              unreadCount={calculatedUnreadCount}
              notifications={notifications}
              onViewAll={handleViewAllNotifications}
              onReadAll={handleReadAllNotifications}
            />
          </div> */}
        </div>
      </header>
      <Separator className="mb-6" />
    </div>
  )
}