// 'use client'

// import { useState } from 'react'
// import { RouteCalculator } from './components/RouteCalculator'
// import { RouteInfo, RouteInfoProps } from './components/RouteInfo'

// export default function SimularViajePage() {
//   const [routeInfo, setRouteInfo] = useState<RouteInfoProps | null>(null)

//   const handleRouteCalculated = (data: any) => {
//     if (!data?.routes?.[0]) return;

//     const route = data.routes[0];
//     const formattedInfo: RouteInfoProps = {
//       distance: {
//         meters: route.distanceMeters,
//         text: `${(route.distanceMeters / 1000).toFixed(1)} km`
//       },
//       duration: route.duration,
//       hasTolls: !!route.travelAdvisory?.tollInfo,
//       estimatedPrice: route.travelAdvisory?.tollInfo?.estimatedPrice
//     };

//     console.log('Formatted route info:', formattedInfo);
//     setRouteInfo(formattedInfo);
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-4">Simular Viaje</h1>
//       <RouteCalculator onRouteCalculated={handleRouteCalculated} />
//       {routeInfo && <RouteInfo {...routeInfo} />}
//     </div>
//   )
// }

import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import SimularViajePage from './components/SimularViajePage'

export const metadata = {
  title: 'Simular Viaje | Tengo Lugar',
  description: 'Simula tu viaje y calcula la ruta óptima con Tengo Lugar',
}

export default function Page() {
  return (
    <Suspense fallback={<SimularViajeSkeletonLoader />}>
      <SimularViajePage />
    </Suspense>
  )
}

function SimularViajeSkeletonLoader() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="w-48 h-8 mb-4" />
      <Skeleton className="w-full h-64 mb-4" />
      <Skeleton className="w-full h-32" />
    </div>
  )
}

