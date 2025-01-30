// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { formatDuration } from "@/utils/formatDuration";

// interface TollPrice {
//   currencyCode: string;
//   units: string;
//   nanos: number;
// }

// export interface RouteInfoProps {
//   distance: {
//     meters: number;
//     text: string;
//   };
//   duration: string;
//   hasTolls: boolean;
//   estimatedPrice?: TollPrice[];
// }

// export function RouteInfo({ 
//   distance = { meters: 0, text: '0 km' }, 
//   duration = '0s', 
//   hasTolls = false, 
//   estimatedPrice 
// }: RouteInfoProps) {
  
//   // Agregamos validación adicional
//   const distanceInKm = distance?.meters ? (distance.meters / 1000).toFixed(1) : '0';
  
//   const formatPrice = (price?: TollPrice[]) => {
//     if (!price || price.length === 0) return 'No disponible';
    
//     try {
//       const { currencyCode, units, nanos } = price[0];
//       const decimal = nanos ? (nanos / 1000000000).toFixed(2).slice(2) : '00';
//       return `${currencyCode} ${units}.${decimal}`;
//     } catch (error) {
//       console.error('Error formatting price:', error);
//       return 'No disponible';
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto mt-4">
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           Información de la Ruta
//           {hasTolls && (
//             <Badge variant="secondary">
//               Con peajes
//             </Badge>
//           )}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm text-muted-foreground">Distancia</p>
//               <p className="text-lg font-semibold">{distanceInKm} km</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Duración</p>
//               <p className="text-lg font-semibold">{formatDuration(duration)}</p>
//             </div>
//           </div>

//           {hasTolls && (
//             <div className="border-t pt-4">
//               <p className="text-sm text-muted-foreground">Peaje estimado</p>
//               <div className="flex items-center justify-between mt-1">
//                 <p className="text-lg font-semibold">{formatPrice(estimatedPrice)}</p>
//                 <p className="text-xs text-muted-foreground">
//                   *El precio puede variar según el día y hora
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDuration } from "@/utils/format/formatDuration";

interface TollPrice {
  currencyCode: string;
  units: string;
  nanos: number;
}

export interface RouteInfoProps {
  distance: {
    meters: number;
    text: string;
  };
  duration: string;
  hasTolls: boolean;
  estimatedPrice?: TollPrice[];
}

export function RouteInfo({ 
  distance, 
  duration, 
  hasTolls, 
  estimatedPrice 
}: RouteInfoProps) {
  const distanceInKm = distance?.meters ? (distance.meters / 1000).toFixed(1) : '0';
  
  const formatPrice = (price?: TollPrice[]) => {
    if (!price || price.length === 0) return 'No disponible';
    
    try {
      const { currencyCode, units, nanos } = price[0];
      const decimal = nanos ? (nanos / 1000000000).toFixed(2).slice(2) : '00';
      return `${currencyCode} ${units}.${decimal}`;
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'No disponible';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Información de la Ruta
          {hasTolls && (
            <Badge variant="secondary">
              Con peajes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Distancia</p>
              <p className="text-lg font-semibold">{distanceInKm} km</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duración</p>
              <p className="text-lg font-semibold">{formatDuration(duration)}</p>
            </div>
          </div>

          {hasTolls && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Peaje estimado</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-lg font-semibold">{formatPrice(estimatedPrice)}</p>
                <p className="text-xs text-muted-foreground">
                  *El precio puede variar según el día y hora
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

