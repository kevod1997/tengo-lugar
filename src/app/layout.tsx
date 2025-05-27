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

export const metadata: Metadata = {
  title: {
    template: "%s - Tengo Lugar",
    default: "Inicio - Tengo Lugar",
  },
  description: "Donde encuentras tu viaje",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 <html lang="es" className="h-full">
      <body className={`${openSans.className} flex h-full overflow-hidden bg-background`}>
        <Providers>
          <NavigationProgress />
          <NavigationMessageListener />
          <UserUpdatesListener />
          
          {/* Main Layout */}
          <div className="flex w-full">
            <AppSidebar className="hidden lg:flex" />
            <div className="flex flex-col flex-1 w-full m-4 px-2">
              <main className="flex-1 overflow-y-auto pb-16 md:pb-4">
                <Suspense fallback={<Loading />}>
                  {children}
                </Suspense>
              </main>
            </div>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNavigation />
          
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}