'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ChevronDown, ChevronUp, Users, Calendar, CreditCard, CheckCircle, InfoIcon } from 'lucide-react'
import { ParticipantsSection } from './ParticipantsSection'
import { QuickActions } from './QuickActions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { utcToArgentina } from '@/utils/helpers/time/timezone-helper'

interface PassengerTripInfoProps {
  reservation: {
    status: string
    numberOfSeats: number
    totalPrice: number
  }
  trip: {
    id: string
    status: string
    departureTime: Date
    origin: string
    destination: string
    chatRoomId?: string
  }
  payment?: {
    totalAmount: number
    status: string
  }
  coPassengers: any[]
  googleMapsUrl: string
}

export function PassengerTripInfo({
  reservation,
  trip,
  payment,
  coPassengers,
  googleMapsUrl
}: PassengerTripInfoProps) {
  const router = useRouter()
  // Desktop (≥768px) should be open by default, mobile collapsed
  const [isOpen, setIsOpen] = useState(false)

  // Set initial state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const isApprovedOrConfirmed = ['APPROVED', 'CONFIRMED'].includes(reservation.status)
  const showChat = isApprovedOrConfirmed
  const showCoPassengers = isApprovedOrConfirmed

  // Status badge configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'Aprobada',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600'
        }
      case 'CONFIRMED':
        return {
          label: 'Confirmada',
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600'
        }
      case 'PENDING':
        return {
          label: 'Pendiente',
          variant: 'secondary' as const,
          className: 'bg-amber-500 hover:bg-amber-600 text-white'
        }
      case 'REJECTED':
        return {
          label: 'Rechazada',
          variant: 'destructive' as const,
          className: ''
        }
      default:
        return {
          label: status,
          variant: 'outline' as const,
          className: ''
        }
    }
  }

  const statusConfig = getStatusConfig(reservation.status)

  return (
    <Card className="border-slate-200 shadow-sm bg-slate-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Tu reserva
                  </h3>
                  <Badge
                    variant={statusConfig.variant}
                    className={statusConfig.className}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Collapsed summary info */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{reservation.numberOfSeats} {reservation.numberOfSeats === 1 ? 'asiento' : 'asientos'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{format(utcToArgentina(new Date(trip.departureTime)), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    ${reservation.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Expand/Collapse icon */}
              <div className="ml-2">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            <Separator />

            {/* Payment Information Section */}
            {reservation.status === 'APPROVED' && (
              <>
                <div className="space-y-3">
                  <Alert className="bg-blue-50 border-blue-200">
                    <InfoIcon className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900 font-semibold">¡Reserva aprobada!</AlertTitle>
                    <AlertDescription className="text-blue-700 text-sm">
                      El conductor aprobó tu solicitud. Ahora debes completar el pago para confirmar tu lugar.
                    </AlertDescription>
                  </Alert>

                  {payment && (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monto a pagar:</span>
                        <span className="font-mono font-bold text-blue-600">${payment.totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Estado del pago:</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/viajes/${trip.id}/pagar`)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ver instrucciones de pago
                  </Button>
                </div>
                <Separator />
              </>
            )}

            {/* Success alert for CONFIRMED status */}
            {reservation.status === 'CONFIRMED' && (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900 font-semibold">Pago confirmado</AlertTitle>
                  <AlertDescription className="text-green-700 text-sm">
                    Tu pago fue verificado. ¡Estás listo para viajar! 🚗
                  </AlertDescription>
                </Alert>
                <Separator />
              </>
            )}

            {/* Rejection alert */}
            {reservation.status === 'REJECTED' && (
              <>
                <Alert className="bg-orange-50 border-orange-200">
                  <InfoIcon className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-900 font-semibold">Reserva rechazada</AlertTitle>
                  <AlertDescription className="text-orange-700 text-sm">
                    Tu solicitud anterior fue rechazada por el conductor. Puedes volver a reservar si lo deseas.
                  </AlertDescription>
                </Alert>
                <Separator />
              </>
            )}

            {/* Participants Section - Only Co-passengers */}
            {showCoPassengers && (
              <>
                <ParticipantsSection
                  coPassengers={coPassengers}
                  showCoPassengers={showCoPassengers}
                />
                <Separator />
              </>
            )}

            {/* Quick Actions */}
            <QuickActions
              tripStatus={trip.status}
              chatRoomId={trip.chatRoomId}
              googleMapsUrl={googleMapsUrl}
              tripId={trip.id}
              showChat={showChat}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
