import { NavItem } from "@/types/navigation-types";

export const MAX_FILE_SIZE = 3 * 1024 * 1024; //3MB
export const ACCEPTED_FILE_TYPES = [
  "image/jpeg", 
  "image/jpg", 
  "image/png", 
  "application/pdf"
];
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"]

export const UNAUTHENTICATED_NAV_ITEMS: NavItem[] = [
  {
    title: "Buscar",
    url: "/buscar-viaje",
    iconName: "Search",
  },
  {
    title: "Publicar",
    url: "/publicar-viaje",
    iconName: "PlusCircleIcon",
  },
] as const;

export const AUTHENTICATED_NAV_ITEMS: NavItem[] = [
  {
    title: "Buscar",
    url: "/buscar-viaje",
    iconName: "Search",
  },
  {
    title: "Publicar",
    url: "/publicar-viaje",
    iconName: "PlusCircleIcon",
  },
  {
    title: "Mis Viajes",
    url: "/viajes",
    iconName: "CarFrontIcon",
  },
  {
    title: "Mensajes",
    url: "/mensajes",
    iconName: "MessageSquare",
  }
] as const;