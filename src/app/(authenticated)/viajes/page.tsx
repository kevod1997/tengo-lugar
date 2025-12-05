import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserReservations } from "@/actions/trip/get-user-reservations";
import { getUserTrips } from '@/actions/trip/get-user-trips';
import Header from "@/components/header/header";
import { auth } from "@/lib/auth";



import TripsOverview from './components/TripsOverview';

export default async function TripsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/login?redirect_url=/viajes");
  }
  
  // Obtener datos de viajes y reservas en paralelo
  const [tripsData, reservationsData] = await Promise.all([
    getUserTrips(),
    getUserReservations()
  ]);
  
  return (
    <>
      <Header 
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mis Viajes' },
        ]} 
        showBackButton={false}
      />
      <div className="page-content">
        <TripsOverview 
          // Datos de viajes
          activeDriverTrips={tripsData.activeDriverTrips}
          completedDriverTrips={tripsData.completedDriverTrips}
          activePassengerTrips={tripsData.activePassengerTrips}
          completedPassengerTrips={tripsData.completedPassengerTrips}
          // Datos de reservas
          activeReservations={reservationsData.activeReservations}
          completedReservations={reservationsData.completedReservations}
          cancelledReservations={reservationsData.cancelledReservations}
        />
      </div>
    </>
  );
}