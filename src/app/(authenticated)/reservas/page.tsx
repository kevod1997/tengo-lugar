// src/app/mis-reservas/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/header/header";
import { headers } from "next/headers";
import { getUserReservations } from "@/actions/trip/get-user-reservations";
import ReservationsList from "./components/ReservationList";

export default async function MyReservationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/login?redirect_url=/mis-reservas");
  }
  
  const { activeReservations, completedReservations, cancelledReservations } = await getUserReservations();
  
  return (
    <>
      <Header 
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mis Reservas' },
        ]} 
        showBackButton={false}
      />
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Mis Reservas</h1>
        
        <ReservationsList 
          activeReservations={activeReservations}
          completedReservations={completedReservations}
          cancelledReservations={cancelledReservations}
        />
      </div>
    </>
  );
}