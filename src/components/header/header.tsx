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
  breadcrumbs: BreadcrumbItem[]
  className?: string
  showBackButton?: boolean
}

export default function Header({ breadcrumbs, className = '', showBackButton = true }: HeaderProps) {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
    <header className={`mt-3 mb-6 ${className}`}>
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
            <Separator color='black' orientation="vertical" className=" mr-2 h-4" />
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
                    <BreadcrumbLink href={item.href || '#'}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}