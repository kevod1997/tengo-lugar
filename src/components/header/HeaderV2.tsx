// components/header/HeaderV2.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { NotificationButton } from '@/components/notification'

type BreadcrumbItem = {
  label: string
  href?: string
}

interface HeaderV2Props {
  breadcrumbs?: BreadcrumbItem[]
  className?: string
  isSticky?: boolean
  showTooltips?: boolean
  showHomeLink?: boolean
  homeHref?: string
  homeLinkLabel?: string
}

export default function HeaderV2({
  breadcrumbs = [],
  className = '',
  isSticky = true,
  showTooltips = true,
  showHomeLink = true,
  homeHref = '/',
  homeLinkLabel = 'Inicio',
}: HeaderV2Props) {
  const getStickyClasses = () => {
    if (!isSticky) return '';

    return `
      sticky z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90
      top-0 border-b border-border/40
    `.trim()
  }

  // Create full breadcrumb list including home link
  const getFullBreadcrumbs = () => {
    if (!showHomeLink) return breadcrumbs;
    
    const homeItem: BreadcrumbItem = {
      label: homeLinkLabel,
      href: homeHref
    };
    
    // Don't duplicate if first breadcrumb is already home
    if (breadcrumbs.length > 0 && breadcrumbs[0].href === homeHref) {
      return breadcrumbs;
    }
    
    return [homeItem, ...breadcrumbs];
  };

  // Mobile-first breadcrumb logic
  const getMobileBreadcrumbs = () => {
    const fullBreadcrumbs = getFullBreadcrumbs();
    
    // If 2 or fewer items, show all
    if (fullBreadcrumbs.length <= 2) {
      return { breadcrumbs: fullBreadcrumbs, needsHomeIcon: false };
    }
    
    // If 3+ items, show last 2 and indicate we need home icon
    return { 
      breadcrumbs: fullBreadcrumbs.slice(-2), 
      needsHomeIcon: true 
    };
  };

  const BreadcrumbContent = ({ item, isLast, className: itemClassName }: {
    item: BreadcrumbItem, 
    isLast: boolean, 
    className?: string
  }) => {
    const content = isLast ? (
      <BreadcrumbPage className={`font-semibold text-foreground truncate block min-w-0 ${itemClassName || ''}`}>
        {item.label}
      </BreadcrumbPage>
    ) : (
      <BreadcrumbLink 
        className={`text-muted-foreground hover:text-foreground transition-colors truncate block min-w-0 ${itemClassName || ''}`}
        href={item.href || '#'}
      >
        {item.label}
      </BreadcrumbLink>
    );

    if (showTooltips && item.label.length > 25) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={getStickyClasses()}>
        <header className={`px-4 py-3 md:py-4 md:px-6 lg:px-8 ${className}`}>
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-5" />
              
              {/* Mobile Home Icon - shown when breadcrumbs don't include home */}
              {showHomeLink && (
                <div className="md:hidden flex items-center">
                  {getMobileBreadcrumbs().needsHomeIcon && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <Link href={homeHref}>
                              <Home className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{homeLinkLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-muted-foreground mx-1 shrink-0">/</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Center - Breadcrumbs */}
            {(breadcrumbs.length > 0 || showHomeLink) && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <Breadcrumb>
                  {/* Mobile: Show intelligent breadcrumbs */}
                  <BreadcrumbList className="md:hidden !flex-nowrap !break-normal overflow-hidden">
                    {getMobileBreadcrumbs().breadcrumbs.map((item, index, array) => {
                      const isLast = index === array.length - 1;
                      return (
                        <React.Fragment key={index}>
                          {index > 0 && <BreadcrumbSeparator className="shrink-0 mx-1 text-muted-foreground">/</BreadcrumbSeparator>}
                          <BreadcrumbItem className="min-w-0">
                            <BreadcrumbContent 
                              item={item} 
                              isLast={isLast}
                              className={isLast ? "text-base" : "text-sm"}
                            />
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>

                  {/* Desktop: Show full breadcrumbs including home */}
                  <BreadcrumbList className="hidden md:flex !flex-nowrap !break-normal overflow-hidden">
                    {getFullBreadcrumbs().map((item, index, array) => {
                      const isLast = index === array.length - 1;
                      return (
                        <React.Fragment key={index}>
                          {index > 0 && <BreadcrumbSeparator className="shrink-0 mx-2 text-muted-foreground">/</BreadcrumbSeparator>}
                          <BreadcrumbItem className="min-w-0">
                            <BreadcrumbContent 
                              item={item} 
                              isLast={isLast}
                              className={isLast ? "text-lg" : "text-sm"}
                            />
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}

            {/* Right side - Notifications */}
            <div className="flex items-center shrink-0">
              <NotificationButton />
            </div>
          </div>
        </header>
      </div>
    </TooltipProvider>
  )
}