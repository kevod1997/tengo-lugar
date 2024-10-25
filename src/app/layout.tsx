import type { Metadata } from "next";
import "./globals.css";
import { openSans } from "@/config/fonts";
import { Providers } from "@/components/providers/Providers";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s - Tengo Lugar",
    default: "Home - Tengo Lugar",
  },
  description: "Donde encontras tu viaje",
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
          <div className="flex w-full">
            <AppSidebar className="hidden lg:flex" />
            <div className="flex flex-col flex-1 w-full m-4 px-2">
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}