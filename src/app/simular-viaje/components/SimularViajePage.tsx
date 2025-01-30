// 'use client'

// import { useState } from 'react'
// import { RouteInfo, RouteInfoProps } from './RouteInfo';
// import { RouteCalculator } from './RouteCalculator';

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

