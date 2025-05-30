// src/types/navigation-types.ts
export type IconName = "Search" | "PlusCircleIcon" | "CarFrontIcon" | "MessageSquare";

export interface NavSubItem {
  title: string;
  url: string;
  isActive?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  iconName?: IconName; 
  items?: NavSubItem[];
  isActive?: boolean;
}