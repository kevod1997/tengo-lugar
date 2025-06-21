// components/header/header.tsx
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

type BreadcrumbItem = {
  label: string
  href?: string
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  className?: string
  showBackButton?: boolean
  isSticky?: boolean
}

export default function Header({
  breadcrumbs = [],
  className = '',
  showBackButton = true,
  isSticky = true,
}: HeaderProps) {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const getStickyClasses = () => {
    if (!isSticky) return '';

    return `
      sticky z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90
      top-0 border-b border-border/40
    `.trim()
  }

  return (
    <div className={getStickyClasses()}>
      {/* ✅ Mismos márgenes que page-content */}
      <header className={`px-4 py-1 md:py-3 md:px-6 lg:px-8 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            {showBackButton ? (
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
                <Separator orientation="vertical" className="mr-2 h-4" />
              </>
            ) : (
              <div className="h-10" />
            )}
            
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className='text-xl font-semibold'>
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            className='text-xl hover:font-semibold' 
                            href={item.href || '#'}
                          >
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}