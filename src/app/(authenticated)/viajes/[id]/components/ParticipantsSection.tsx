'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CoPassengerCard } from './CoPassengerCard'
import { UserIcon } from 'lucide-react'

interface ParticipantsSectionProps {
  coPassengers: any[]
  showCoPassengers: boolean
}

export function ParticipantsSection({
  coPassengers,
  showCoPassengers
}: ParticipantsSectionProps) {
  return (
    <>
      {/* Co-pasajeros */}
      {showCoPassengers && coPassengers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-slate-900">
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Compañeros de viaje ({coPassengers.length})
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Otros pasajeros confirmados en este viaje
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {coPassengers.map((passenger) => (
                <CoPassengerCard key={passenger.id} passenger={passenger} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
