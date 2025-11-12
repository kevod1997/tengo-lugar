'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comments: string | null;
    createdAt: Date;
    revieweeType: 'DRIVER' | 'PASSENGER';
    reviewer: {
      name: string;
      image: string | null;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { rating, comments, createdAt, revieweeType, reviewer } = review;

  // Generate array of stars for visual rating
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  // Get initials for avatar fallback
  const initials = reviewer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Format date to relative time
  const relativeTime = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: es,
  });

  // Role badge text
  const roleBadgeText =
    revieweeType === 'DRIVER' ? 'Como conductor' : 'Como pasajero';

  return (
    <Card className="border shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-slate-200">
            <AvatarImage src={reviewer.image || undefined} alt={reviewer.name} />
            <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Header: Name, Badge, Date */}
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-slate-900">{reviewer.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {roleBadgeText}
              </Badge>
              <span className="text-xs text-slate-500">• {relativeTime}</span>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {stars.map((filled, index) => (
                <span key={index} className="text-lg">
                  {filled ? '⭐' : '☆'}
                </span>
              ))}
              <span className="ml-2 text-sm font-medium text-slate-700">
                {rating} de 5
              </span>
            </div>

            {/* Comments */}
            {comments && (
              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                {comments}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
