import type { Metadata } from "next";
import "./globals.css";
import { openSans } from "@/config/fonts";
import { Providers } from "@/components/providers/Providers";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Loading from "./loading";
import { NavigationProgress } from "@/components/navigation-progress";
// import { AuthCheck } from "@/components/AuthCheck";
import { NavigationMessageListener } from "@/components/NavigationMessengerListener";

export const metadata: Metadata = {
  title: {
    template: "%s - Tengo Lugar",
    default: "Home - Tengo Lugar",
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
          {/* <AuthCheck /> */}
          <NavigationMessageListener />
          <div className="flex w-full">
            <AppSidebar className="hidden lg:flex" />
            <div className="flex flex-col flex-1 w-full m-4 px-2">
              <main className="flex-1 overflow-y-auto">
                <Suspense fallback={<Loading />}>
                  {children}
                </Suspense>
              </main>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}