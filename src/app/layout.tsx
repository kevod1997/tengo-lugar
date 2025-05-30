// import type { Metadata } from "next";
// import "./globals.css";
// import { openSans } from "@/config/fonts";
// import { Providers } from "@/components/providers/Providers";
// import { AppSidebar } from "@/components/app-sidebar";
// import { Toaster } from "sonner";
// import { Suspense } from "react";
// import Loading from "./loading";
// import { NavigationProgress } from "@/components/navigation-progress";
// import { NavigationMessageListener } from "@/components/NavigationMessengerListener";
// import { UserUpdatesListener } from "@/components/UserUpdatesListener";
// import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

// export const metadata: Metadata = {
//   title: {
//     template: "%s - Tengo Lugar",
//     default: "Inicio - Tengo Lugar",
//   },
//   description: "Donde encuentras tu viaje",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//  <html lang="es" className="h-full">
//       <body className={`${openSans.className} flex h-full overflow-hidden bg-background`}>
//         <Providers>
//           <NavigationProgress />
//           <NavigationMessageListener />
//           <UserUpdatesListener />
          
//           {/* Main Layout */}
//           <div className="flex w-full">
//             <AppSidebar className="hidden lg:flex" />
//             <div className="flex flex-col flex-1 w-full m-4 px-2">
//               <main className="flex-1 overflow-y-auto pb-16 md:pb-4">
//                 <Suspense fallback={<Loading />}>
//                   {children}
//                 </Suspense>
//               </main>
//             </div>
//           </div>
          
//           {/* Mobile Bottom Navigation */}
//           <MobileBottomNavigation />
          
//           <Toaster />
//         </Providers>
//       </body>
//     </html>
//   );
// }


// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { openSans } from "@/config/fonts";
import { Providers } from "@/components/providers/Providers";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Loading from "./loading";
import { NavigationProgress } from "@/components/navigation-progress";
import { NavigationMessageListener } from "@/components/NavigationMessengerListener";
import { UserUpdatesListener } from "@/components/UserUpdatesListener";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

import { auth } from "@/lib/auth";
// You don't strictly need to import the Lucide components here anymore for the nav items,
// but they will be imported in NavMain.tsx.

// Import your shared navigation types
import { headers } from "next/headers";
import { NavItem } from "@/types/navigation-types";

export const metadata: Metadata = {
  title: {
    template: "%s - Tengo Lugar",
    default: "Inicio - Tengo Lugar",
  },
  description: "Donde encuentras tu viaje",
};

// Define navigation data structure using iconName
const baseNavItems: NavItem[] = [
  {
    title: "Buscar",
    url: "/buscar-viaje",
    iconName: "Search", // Pass the name as a string
  },
  {
    title: "Publicar",
    url: "/publicar-viaje",
    iconName: "PlusCircleIcon", // Pass the name as a string
  },
];

const authenticatedNavItems: NavItem[] = [
  {
    title: "Mis Viajes",
    url: "/viajes",
    iconName: "CarFrontIcon", // Pass the name as a string
  },
  {
    title: "Mensajes",
    url: "/mensajes",
    iconName: "MessageSquare", // Pass the name as a string
  }
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  const isSignedIn = !!session?.user;

  const navItemsForSidebar: NavItem[] = isSignedIn
    ? [...baseNavItems, ...authenticatedNavItems]
    : baseNavItems;

  return (
    <html lang="es" className="h-full">
      <body className={`${openSans.className} flex h-full overflow-hidden bg-background`}>
        <Providers>
          <NavigationProgress />
          <NavigationMessageListener />
          <UserUpdatesListener />
          
          <div className="flex w-full">
            <AppSidebar className="hidden lg:flex" initialNavItems={navItemsForSidebar} />
            <div className="flex flex-col flex-1 w-full m-4 px-2">
              <main className="flex-1 overflow-y-auto pb-16 md:pb-4">
                <Suspense fallback={<Loading />}>
                  {children}
                </Suspense>
              </main>
            </div>
          </div>
          
          <MobileBottomNavigation />
          
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}