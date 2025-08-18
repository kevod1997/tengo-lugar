// app/admin/layout.tsx
import { requireAuthorization, UserRoles } from "@/utils/helpers/auth-helper";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Usar tu helper existente
    await requireAuthorization(UserRoles.ADMIN, "admin/layout.tsx", "AdminLayout");
  } catch (error) {
    // Si no es admin, redirigir al home
    console.log(error);
    redirect("/");
  }

  return (
      <main>
        {children}
      </main>
  );
}