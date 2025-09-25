import { getTripById } from "@/actions/trip/get-trip-by-id";
import { checkTripAccess } from "@/actions/trip/check-trip-access";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/header/header";
import { headers } from "next/headers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PassengersList from "./components/PassengerList";
import TripManagement from "./components/TripManagement";

export default async function TripManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const resolvedParams = await params;
  if (!session) {
    redirect(`/login?redirect_url=/viajes/${resolvedParams.id}/gestionar-viaje`);
  }


  // Check if user is the driver of this trip
  const accessCheck = await checkTripAccess(resolvedParams.id);

  if (!accessCheck.authorized || !accessCheck.isDriver) {
    redirect(`/viajes/${resolvedParams.id}`);
  }

  const trip = await getTripById(resolvedParams.id);

  if (!trip) {
    notFound();
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mis Viajes', href: '/viajes' },
          { label: 'Detalles del viaje', href: `/viajes/${resolvedParams.id}` },
          { label: 'Gestionar Viaje' },
        ]}
      />
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestionar Viaje</h1>
            <p className="text-muted-foreground">
              {trip.originCity} a {trip.destinationCity} • {new Date(trip.departureTime).toLocaleDateString()}
            </p>
          </div>

          {/* Add a trip status indicator here */}
          <div className="mt-2 sm:mt-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trip.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                trip.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  trip.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
              }`}>
              {trip.status === 'PENDING' ? 'Pendiente' :
                trip.status === 'ACTIVE' ? 'Activo' :
                  trip.status === 'COMPLETED' ? 'Completado' :
                    'Cancelado'}
            </span>
          </div>
        </div>

        <Tabs defaultValue="passengers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="passengers">Pasajeros</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="passengers" className="mt-6">
            <PassengersList trip={trip} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <TripManagement trip={trip} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}