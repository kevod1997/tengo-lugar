'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReviewCard } from './ReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getReviewsForUser } from '@/actions/review/get-reviews-for-user';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ReviewsListProps {
  userId: string;
  initialType?: 'DRIVER' | 'PASSENGER';
}

export function ReviewsList({ userId, initialType = 'DRIVER' }: ReviewsListProps) {
  const [reviewType, setReviewType] = useState<'DRIVER' | 'PASSENGER'>(initialType);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch reviews for the selected type
  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', userId, reviewType],
    queryFn: async () => {
      const result = await getReviewsForUser({
        userId,
        revieweeType: reviewType,
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Error al cargar las calificaciones');
      }

      return result.data;
    },
  });

  const reviews = data?.reviews || [];

  return (
    <div className="space-y-4">
      {/* Header - Collapsible Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">
            Mis Reseñas
          </h3>
          {reviews.length > 0 && (
            <span className="text-sm text-slate-500">
              ({reviews.length})
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-1"
        >
          {isExpanded ? (
            <>
              Ocultar <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Ver reseñas <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Toggle Selector */}
          <Tabs
            value={reviewType}
            onValueChange={(value) => setReviewType(value as 'DRIVER' | 'PASSENGER')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="DRIVER">
                👤 Como Conductor
              </TabsTrigger>
              <TabsTrigger value="PASSENGER">
                🚗 Como Pasajero
              </TabsTrigger>
            </TabsList>

            <TabsContent value={reviewType} className="space-y-4 mt-4">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 bg-red-50">
                  <Info className="h-12 w-12 text-red-400 mb-2" />
                  <p className="text-red-700 text-sm">
                    Error al cargar las calificaciones
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && reviews.length === 0 && (
                <div className="flex flex-col items-center justify-center p-10 rounded-lg border border-slate-200 bg-slate-50">
                  <Info className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 text-center">
                    Aún no tienes calificaciones como{' '}
                    {reviewType === 'DRIVER' ? 'conductor' : 'pasajero'}
                  </p>
                </div>
              )}

              {/* Reviews List */}
              {!isLoading && !error && reviews.length > 0 && (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
