// // src/app/viajes/components/TripsOverview.tsx
// 'use client'

// import { useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import TripsList from './TripList';

// type TripsOverviewProps = {
//   activeDriverTrips: any[];
//   completedDriverTrips: any[];
//   activePassengerTrips: any[];
//   completedPassengerTrips: any[];
// };

// export default function TripsOverview({
//   activeDriverTrips,
//   completedDriverTrips,
//   activePassengerTrips,
//   completedPassengerTrips,
// }: TripsOverviewProps) {
//   const [roleFilter, setRoleFilter] = useState<'todos' | 'conductor' | 'pasajero'>('todos');

//   // Calculate counts for badge displays
//   const activeDriverCount = activeDriverTrips.length;
//   const activePassengerCount = activePassengerTrips.length;
//   const completedDriverCount = completedDriverTrips.length;
//   const completedPassengerCount = completedPassengerTrips.length;

//   // Filter trips based on selected role
//   const getFilteredActiveTrips = () => {
//     if (roleFilter === 'conductor') return activeDriverTrips;
//     if (roleFilter === 'pasajero') return activePassengerTrips;
//     return [...activeDriverTrips, ...activePassengerTrips];
//   };

//   const getFilteredCompletedTrips = () => {
//     if (roleFilter === 'conductor') return completedDriverTrips;
//     if (roleFilter === 'pasajero') return completedPassengerTrips;
//     return [...completedDriverTrips, ...completedPassengerTrips];
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Mis Viajes</h1>

//         <select
//           className="border rounded-md px-3 py-1 bg-background"
//           value={roleFilter}
//           onChange={(e) => setRoleFilter(e.target.value as any)}
//         >
//           <option value="todos">Todos los roles</option>
//           <option value="conductor">Como conductor</option>
//           <option value="pasajero">Como pasajero</option>
//         </select>
//       </div>

//       <Tabs defaultValue="activos" className="w-full">
//         <TabsList className="w-full">
//           <TabsTrigger value="activos" className="flex-1 relative">
//             Viajes Activos
//             {(activeDriverCount + activePassengerCount) > 0 && (
//               <Badge className="ml-2 bg-primary text-primary-foreground">
//                 {roleFilter === 'conductor' ? activeDriverCount : 
//                  roleFilter === 'pasajero' ? activePassengerCount : 
//                  activeDriverCount + activePassengerCount}
//               </Badge>
//             )}
//           </TabsTrigger>
//           <TabsTrigger value="finalizados" className="flex-1">
//             Viajes Finalizados
//             {(completedDriverCount + completedPassengerCount) > 0 && (
//               <Badge className="ml-2 bg-secondary text-secondary-foreground">
//                 {roleFilter === 'conductor' ? completedDriverCount : 
//                  roleFilter === 'pasajero' ? completedPassengerCount : 
//                  completedDriverCount + completedPassengerCount}
//               </Badge>
//             )}
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="activos" className="mt-6">
//           <TripsList 
//             trips={getFilteredActiveTrips()} 
//             emptyMessage="No tienes viajes activos en este momento"
//             showRoleIndicator={roleFilter === 'todos'}
//           />
//         </TabsContent>

//         <TabsContent value="finalizados" className="mt-6">
//           <TripsList 
//             trips={getFilteredCompletedTrips()} 
//             emptyMessage="No tienes viajes finalizados aún"
//             showRoleIndicator={roleFilter === 'todos'}
//           />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// src/app/viajes/components/TripsOverview.tsx
'use client'

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Car, Filter, PlusCircle } from "lucide-react"
import { useRouter } from 'next/navigation';
import TripsList from './TripList';

type TripsOverviewProps = {
  activeDriverTrips: any[];
  completedDriverTrips: any[];
  activePassengerTrips: any[];
  completedPassengerTrips: any[];
};

export default function TripsOverview({
  activeDriverTrips,
  completedDriverTrips,
  activePassengerTrips,
  completedPassengerTrips,
}: TripsOverviewProps) {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<'todos' | 'conductor' | 'pasajero'>('todos');

  // Calculate counts for badge displays
  const activeDriverCount = activeDriverTrips.length;
  const activePassengerCount = activePassengerTrips.length;
  const completedDriverCount = completedDriverTrips.length;
  const completedPassengerCount = completedPassengerTrips.length;

  // Calculate pending passengers count across all trips
  const pendingPassengersCount = activeDriverTrips.reduce((count, trip) => {
    return count + trip.passengers.filter((p: any) => p.reservationStatus === 'PENDING_APPROVAL').length;
  }, 0);

  // Filter trips based on selected role
  const getFilteredActiveTrips = () => {
    if (roleFilter === 'conductor') return activeDriverTrips;
    if (roleFilter === 'pasajero') return activePassengerTrips;
    return [...activeDriverTrips, ...activePassengerTrips];
  };

  const getFilteredCompletedTrips = () => {
    if (roleFilter === 'conductor') return completedDriverTrips;
    if (roleFilter === 'pasajero') return completedPassengerTrips;
    return [...completedDriverTrips, ...completedPassengerTrips];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis Viajes</h1>
          {pendingPassengersCount > 0 && (
            <p className="text-orange-600 text-sm mt-1">
              Tienes {pendingPassengersCount} solicitud(es) pendiente(s) de aprobación
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* <select
            className="border rounded-md px-3 py-1 bg-background w-full sm:w-auto"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="todos">Todos los roles</option>
            <option value="conductor">Como conductor</option>
            <option value="pasajero">Como pasajero</option>
          </select> */}
          <Tabs
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as 'todos' | 'conductor' | 'pasajero')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="todos" className="flex items-center justify-center">
                <Filter className="mr-2 h-4 w-4 hidden sm:inline" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="conductor" className="flex items-center justify-center">
                <Car className="mr-2 h-4 w-4 hidden sm:inline" />
                Conductor
              </TabsTrigger>
              <TabsTrigger value="pasajero" className="flex items-center justify-center">
                <Users className="mr-2 h-4 w-4 hidden sm:inline" />
                Pasajero
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => router.push('/publicar-viaje')} className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo viaje
          </Button>
        </div>
      </div>

      <Tabs defaultValue="activos" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="activos" className="flex-1 relative">
            Viajes Activos
            {(activeDriverCount + activePassengerCount) > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {roleFilter === 'conductor' ? activeDriverCount :
                  roleFilter === 'pasajero' ? activePassengerCount :
                    activeDriverCount + activePassengerCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="finalizados" className="flex-1">
            Viajes Finalizados
            {(completedDriverCount + completedPassengerCount) > 0 && (
              <Badge className="ml-2 bg-secondary text-secondary-foreground">
                {roleFilter === 'conductor' ? completedDriverCount :
                  roleFilter === 'pasajero' ? completedPassengerCount :
                    completedDriverCount + completedPassengerCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-6">
          <TripsList
            trips={getFilteredActiveTrips()}
            emptyMessage="No tienes viajes activos en este momento"
            showRoleIndicator={roleFilter === 'todos'}
          />
        </TabsContent>

        <TabsContent value="finalizados" className="mt-6">
          <TripsList
            trips={getFilteredCompletedTrips()}
            emptyMessage="No tienes viajes finalizados aún"
            showRoleIndicator={roleFilter === 'todos'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}