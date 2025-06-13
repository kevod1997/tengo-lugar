// app/(public)/layout.tsx
import { Footer } from "@/components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}