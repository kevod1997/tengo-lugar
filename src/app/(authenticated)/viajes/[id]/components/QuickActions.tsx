'use client'

import { useState } from 'react'

import Link from 'next/link'

import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Map, Star, Receipt } from 'lucide-react'

import { canUserReview } from '@/actions/review/can-user-review'
import { ReviewModal } from '@/components/reviews/ReviewModal'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  tripStatus: string
  chatRoomId?: string
  googleMapsUrl: string
  tripId: string
  showChat: boolean
  autoOpenReview?: boolean
}

export function QuickActions({
  tripStatus,
  chatRoomId,
  googleMapsUrl,
  tripId,
  showChat,
  autoOpenReview = false
}: QuickActionsProps) {
  const isActive = ['PENDING', 'ACTIVE'].includes(tripStatus)
  const isCompleted = tripStatus === 'COMPLETED'
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(autoOpenReview)

  // Fetch review eligibility
  const { data: reviewData, isLoading: isLoadingReview } = useQuery({
    queryKey: ['canReview', tripId],
    queryFn: async () => {
      const result = await canUserReview({ tripId })
      if (!result.success) {
        return null
      }
      return result.data
    },
    enabled: isCompleted,
  })

  const canReview = reviewData?.canReview || false
  const hasAlreadyReviewed = reviewData?.pendingUsers?.length === 0 && reviewData?.reviewableUsers?.length > 0
  const isWithinWindow = reviewData?.tripCompletedAt ? true : false
  const reviewableUsers = reviewData?.pendingUsers || []

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
            {/* Botón de calificar - Sistema de reviews activo */}
            {canReview && isWithinWindow && !hasAlreadyReviewed && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                onClick={() => setIsReviewModalOpen(true)}
                disabled={isLoadingReview}
              >
                <Star className="h-4 w-4" />
                <span className="text-sm">Calificar viaje</span>
              </Button>
            )}

            {/* Ver calificaciones ya dejadas */}
            {hasAlreadyReviewed && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                asChild
              >
                <a href="#mis-calificaciones">
                  <Star className="h-4 w-4 fill-green-500 text-green-500" />
                  <span className="text-sm">Ver mi calificación</span>
                </a>
              </Button>
            )}

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
      {isCompleted && !isWithinWindow && !hasAlreadyReviewed && (
        <p className="text-xs text-amber-600 mt-2 text-center">
          Ya no puedes calificar este viaje (han pasado más de 10 días)
        </p>
      )}

      {/* Review Modal */}
      {reviewableUsers.length > 0 && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          tripId={tripId}
          reviewableUsers={reviewableUsers}
        />
      )}
    </div>
  )
}
