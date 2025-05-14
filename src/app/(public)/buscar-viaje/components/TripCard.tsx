// app/(public)/viajes/components/trip-card.tsx
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trip } from '@/types/trip-types'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  // Extract first name from full name
  const firstName = trip.driverName.split(' ')[0];
  
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Trip info section - left side */}
          <div className="sm:col-span-8 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Origen</p>
              <p className="font-medium">{trip.originCity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destino</p>
              <p className="font-medium">{trip.destinationCity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Horario</p>
              <p className="font-medium">
                {format(new Date(trip.departureTime), 'HH:mm', { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Asientos disponibles</p>
              <p className="font-medium">{trip.availableSeats}</p>
            </div>
          </div>
          
          {/* Price, avatar and action section - right side */}
          <div className="sm:col-span-4 flex items-center justify-between sm:justify-end gap-4">
            {/* Price */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Precio</p>
              <p className="text-lg font-bold text-primary">${trip.price}</p>
            </div>
            
            {/* Avatar and name positioned horizontally */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={trip.driverProfileImage || undefined} alt={firstName} />
                <AvatarFallback>{firstName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{firstName}</span>
            </div>
            
            {/* Action button using Next.js Link */}
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full h-8 w-8 flex-shrink-0"
              asChild
            >
              <Link href={`/viajes/${trip.id}`} aria-label="Ver más información">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}