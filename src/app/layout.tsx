// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { openSans } from "@/config/fonts";
import { Providers } from "@/components/providers/Providers";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Loading from "./loading";
import { NavigationProgress } from "@/components/navigation-progress";
import { MobileBottomNavigationClient } from "@/components/MobileBottomNavigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AUTHENTICATED_NAV_ITEMS, UNAUTHENTICATED_NAV_ITEMS } from "@/config/constants";
import { LoadingOverlay } from "@/components/loader/loading-overlay";

export const metadata: Metadata = {
  title: {
    template: "%s - Tengo Lugar",
    default: "Inicio - Tengo Lugar",
  },
  description: "Donde encuentras tu viaje",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSignedIn = !!session?.user;

  return (
    <html lang="es" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-title" content="Tengo Lugar" />
      </head>
      <body className={`${openSans.className} flex h-full overflow-hidden bg-background`}>
        <Providers initialSession={session}>
          <LoadingOverlay
            overlayOperations={['authenticatingUser', 'signingOut', 'authRedirect', 'navigatingToTrip']}
          />
          <NavigationProgress />

          <div className="flex w-full">
            <AppSidebar
              className="hidden lg:flex"
              initialNavItems={isSignedIn ? AUTHENTICATED_NAV_ITEMS : UNAUTHENTICATED_NAV_ITEMS}
              initialSession={session}
            />

            {/* ✅ LIMPIO - Sin márgenes forzados */}
            <div className="flex flex-col flex-1 w-full">
              <main className={`flex-1 overflow-y-auto ${isSignedIn ? "pb-16 md:pb-0" : ""}`}>
                <Suspense fallback={<Loading />}>
                  {children}
                </Suspense>
              </main>
            </div>
          </div>

          {isSignedIn && <MobileBottomNavigationClient />}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}