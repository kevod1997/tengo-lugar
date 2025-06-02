"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Search,
  CarFrontIcon,
  PlusCircleIcon,
  MessageSquare,
  HelpCircle 
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavItem as AppNavItemType, IconName } from '@/types/navigation-types'; 

const iconComponents: Record<IconName, LucideIcon> = {
  Search: Search,
  CarFrontIcon: CarFrontIcon,
  PlusCircleIcon: PlusCircleIcon,
  MessageSquare: MessageSquare,
};

const DefaultIcon = HelpCircle;

export function NavMain({
  items,
}: {
  items: AppNavItemType[] 
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Viajes compartidos, posta.</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Dynamically select the icon component based on iconName
          const IconComponent = item.iconName ? (iconComponents[item.iconName] || DefaultIcon) : null;

          return (
            <SidebarMenuItem key={item.title}>
              {item.items && item.items.length > 0 ? (
                <Collapsible
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <div>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {IconComponent && <IconComponent className="h-4 w-4" />} {/* Render the selected icon component */}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
