// "use client"

// import { ChevronRight, type LucideIcon } from "lucide-react"

// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"
// import {
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
// } from "@/components/ui/sidebar"

// export function NavMain({
//   items,
// }: {
//   items: {
//     title: string
//     url: string
//     icon?: LucideIcon
//     isActive?: boolean
//     items?: {
//       title: string
//       url: string
//     }[]
//   }[]
// }) {
//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel>Viajes compartidos, posta.</SidebarGroupLabel>
//       <SidebarMenu>
//         {items.map((item) => (
//           <SidebarMenuItem key={item.title}>
//             {item.items && item.items.length > 0 ? (
//               <Collapsible
//                 asChild
//                 defaultOpen={item.isActive}
//                 className="group/collapsible"
//               >
//                 <div>
//                   <CollapsibleTrigger asChild>
//                     <SidebarMenuButton tooltip={item.title}>
//                       {item.icon && <item.icon />}
//                       <span>{item.title}</span>
//                       <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
//                     </SidebarMenuButton>
//                   </CollapsibleTrigger>
//                   <CollapsibleContent>
//                     <SidebarMenuSub>
//                       {item.items.map((subItem) => (
//                         <SidebarMenuSubItem key={subItem.title}>
//                           <SidebarMenuSubButton asChild>
//                             <a href={subItem.url}>
//                               <span>{subItem.title}</span>
//                             </a>
//                           </SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                       ))}
//                     </SidebarMenuSub>
//                   </CollapsibleContent>
//                 </div>
//               </Collapsible>
//             ) : (
//               <SidebarMenuButton asChild tooltip={item.title}>
//                 <a href={item.url}>
//                   {item.icon && <item.icon />}
//                   <span>{item.title}</span>
//                 </a>
//               </SidebarMenuButton>
//             )}
//           </SidebarMenuItem>
//         ))}
//       </SidebarMenu>
//     </SidebarGroup>
//   )
// }

"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
// Import ALL Lucide icons that can be used in the navigation
import {
  Search,
  CarFrontIcon,
  PlusCircleIcon,
  MessageSquare,
  // Add any other icons you might use by name from IconName type in navigation.ts
  HelpCircle // Example default/fallback icon
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

// Import the updated NavItem type and IconName
import type { NavItem as AppNavItemType, IconName } from '@/types/navigation-types'; 

// Helper to map icon names to actual components
// Ensure this map includes all names defined in your IconName type
const iconComponents: Record<IconName, LucideIcon> = {
  Search: Search,
  CarFrontIcon: CarFrontIcon,
  PlusCircleIcon: PlusCircleIcon,
  MessageSquare: MessageSquare,
  // Add other mappings here if you extend IconName type
};

const DefaultIcon = HelpCircle; // A fallback icon if a name is somehow not in the map

export function NavMain({
  items,
}: {
  items: AppNavItemType[] // Use the imported type which contains iconName
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
                    {IconComponent && <IconComponent className="h-4 w-4" />} {/* Render the selected icon component */}
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
