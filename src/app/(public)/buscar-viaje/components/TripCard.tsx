// app/(public)/viajes/components/trip-card.tsx
// import { format } from 'date-fns'
// import { es } from 'date-fns/locale'
// import { Trip } from '@/types/trip-types'
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { ChevronRight } from "lucide-react"
// import Link from "next/link"

// interface TripCardProps {
//   trip: Trip
// }

// export function TripCard({ trip }: TripCardProps) {
//   // Extract first name from full name
//   const firstName = trip.driverName.split(' ')[0];
  
//   return (
//     <Card className="transition-shadow hover:shadow-md">
//       <CardContent className="p-4">
//         <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
//           {/* Trip info section - left side */}
//           <div className="sm:col-span-8 grid grid-cols-2 gap-x-4 gap-y-2">
//             <div>
//               <p className="text-xs text-muted-foreground">Origen</p>
//               <p className="font-medium">{trip.originCity}</p>
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Destino</p>
//               <p className="font-medium">{trip.destinationCity}</p>
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Horario</p>
//               <p className="font-medium">
//                 {format(new Date(trip.departureTime), 'HH:mm', { locale: es })}
//               </p>
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Asientos disponibles</p>
//               <p className="font-medium">{trip.availableSeats}</p>
//             </div>
//           </div>
          
//           {/* Price, avatar and action section - right side */}
//           <div className="sm:col-span-4 flex items-center justify-between sm:justify-end gap-4">
//             {/* Price */}
//             <div className="text-right">
//               <p className="text-xs text-muted-foreground">Precio</p>
//               <p className="text-lg font-bold text-primary">${trip.price}</p>
//             </div>
            
//             {/* Avatar and name positioned horizontally */}
//             <div className="flex items-center gap-2">
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src={trip.driverProfileImage || undefined} alt={firstName} />
//                 <AvatarFallback>{firstName.charAt(0)}</AvatarFallback>
//               </Avatar>
//               <span className="text-sm">{firstName}</span>
//             </div>
            
//             {/* Action button using Next.js Link */}
//             <Button 
//               size="icon" 
//               variant="secondary" 
//               className="rounded-full h-8 w-8 flex-shrink-0"
//               asChild
//             >
//               <Link href={`/viajes/${trip.id}`} aria-label="Ver más información">
//                 <ChevronRight className="h-4 w-4" />
//               </Link>
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trip } from '@/types/trip-types'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, PlusCircle, ArrowRightCircle } from "lucide-react"
import Link from "next/link"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const rawFirstName = trip.driverName.split(' ')[0];
  const displayName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);
  
  return (
    <Card 
      className={cn(
        "transition-shadow hover:shadow-xl w-full", // Standard hover shadow
        "bg-violet-50 dark:bg-violet-900/10" 
      )}
    >
      <CardContent className="p-4 space-y-5"> {/* Increased space between top and bottom sections */}
        {/* Top Section: Driver Info, Price, Seats */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={trip.driverProfileImage || undefined} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-md">{displayName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">${trip.price}</p>
            {trip.availableSeats > 0 && (
              <Badge 
                className="mt-1 text-xs bg-primary text-white"
              >
                Quedan {trip.availableSeats} asiento{trip.availableSeats === 1 ? '' : 's'}
              </Badge>
            )}
          </div>
        </div>

        {/* Bottom Section: Trip Details (Timeline-like) */}
        {/* This container helps group the timeline rows if more spacing is needed around them collectively */}
        <div>
          {/* Origin Row */}
          <div className="flex items-start"> {/* Use items-start for top alignment of icon with text block */}
            <div className="w-8 flex flex-col items-center mr-3 shrink-0 pt-[3px]"> {/* Icon container, pt for fine-tuning */}
              <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {/* Vertical line with fixed height to create space and visually connect */}
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-600 mt-2 mb-1"></div>
            </div>
            <div className="flex-grow pt-[2px]"> {/* Text content, pt for fine-tuning */}
              <span className="text-sm font-medium block leading-snug">
                {format(new Date(trip.departureTime), 'HH:mm', { locale: es })}
              </span>
              <span className="text-md text-gray-800 dark:text-gray-200 block leading-snug">{trip.originCity}</span>
            </div>
          </div>

          {/* Destination Row */}
          <div className="flex items-start"> {/* Use items-start */}
            <div className="w-8 flex flex-col items-center mr-3 shrink-0 pt-[3px]"> {/* Icon container */}
              <ArrowRightCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-grow pt-[2px] flex items-center justify-between"> {/* Text content + Button */}
              <div>
                <span className="text-sm font-medium block leading-snug text-muted-foreground">Llegada</span>
                <span className="text-md font-semibold block leading-snug">{trip.destinationCity}</span>
              </div>
              <Link href={`/viajes/${trip.id}`} passHref legacyBehavior>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-primary h-10 w-10 ml-auto shrink-0" 
                  aria-label="Ver detalles del viaje"
                >
                  <PlusCircle className="h-7 w-7" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}