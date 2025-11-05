'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle, Map, Star, Receipt } from 'lucide-react'
import Link from 'next/link'

interface QuickActionsProps {
  tripStatus: string
  chatRoomId?: string
  googleMapsUrl: string
  tripId: string
  showChat: boolean
}

export function QuickActions({
  tripStatus,
  chatRoomId,
  googleMapsUrl,
  showChat
}: QuickActionsProps) {
  const isActive = ['PENDING', 'ACTIVE'].includes(tripStatus)
  const isCompleted = tripStatus === 'COMPLETED'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <div className="h-1 w-1 rounded-full bg-blue-500" />
        Acciones rápidas
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Chat - Solo si está disponible y viaje activo */}
        {showChat && isActive && chatRoomId && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
            asChild
          >
            <Link href={`/mensajes?chat=${chatRoomId}`}>
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Ir al chat del viaje</span>
            </Link>
          </Button>
        )}

        {/* Ver ruta en Maps - Siempre disponible */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50"
          asChild
        >
          <Link href={googleMapsUrl} target="_blank">
            <Map className="h-4 w-4" />
            <span className="text-sm">Ver ruta en Maps</span>
          </Link>
        </Button>

        {/* Acciones post-viaje - Solo si está completado */}
        {isCompleted && (
          <>
            {/* Botón de calificar - preparado para futuro sistema de reviews */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
              disabled
              title="Próximamente: Sistema de calificaciones"
            >
              <Star className="h-4 w-4" />
              <span className="text-sm">Calificar viaje</span>
            </Button>

            {/* Botón de recibo - preparado para futuro */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50"
              disabled
              title="Próximamente: Descargar recibo"
            >
              <Receipt className="h-4 w-4" />
              <span className="text-sm">Ver recibo</span>
            </Button>
          </>
        )}
      </div>

      {/* Nota informativa para viajes completados */}
      {isCompleted && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Las funciones de calificación y recibo estarán disponibles próximamente
        </p>
      )}
    </div>
  )
}
