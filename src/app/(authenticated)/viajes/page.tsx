import { getUserTrips } from '@/actions/trip/get-user-trips';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Header from "@/components/header/header";
import TripsOverview from './components/TripsOverview';

export default async function TripsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/login?redirect_url=/viajes");
  }
  
  const tripsData = await getUserTrips();
  
  return (
    <>
      <Header 
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mis Viajes' },
        ]} 
        showBackButton={false}
      />
      <div className="container py-6">
        <TripsOverview 
          activeDriverTrips={tripsData.activeDriverTrips}
          completedDriverTrips={tripsData.completedDriverTrips}
          activePassengerTrips={tripsData.activePassengerTrips}
          completedPassengerTrips={tripsData.completedPassengerTrips}
        />
      </div>
    </>
  );
}