'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createReview } from '@/actions/review/create-review';
import { Loader2, Star, CheckCircle2 } from 'lucide-react';

// Validation schema
const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Debes seleccionar una calificación').max(5),
  comments: z
    .string()
    .max(200, 'Los comentarios no pueden exceder 200 caracteres')
    .optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewableUser {
  id: string;
  name: string;
  image: string | null;
  role: 'DRIVER' | 'PASSENGER';
  alreadyReviewed: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  reviewableUsers: ReviewableUser[];
}

export function ReviewModal({
  isOpen,
  onClose,
  tripId,
  reviewableUsers,
}: ReviewModalProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const currentUser = reviewableUsers[currentUserIndex];
  const hasMoreUsers = currentUserIndex < reviewableUsers.length - 1;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comments: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      return await createReview({
        tripId,
        reviewedId: currentUser.id,
        revieweeType: currentUser.role,
        rating: values.rating,
        comments: values.comments || undefined,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        // Mark as completed
        setCompletedReviews((prev) => new Set(prev).add(currentUser.id));

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['canReview', tripId] });
        queryClient.invalidateQueries({ queryKey: ['myReviews', tripId] });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });

        toast.success('¡Gracias por tu calificación!');

        // Move to next user or close
        if (hasMoreUsers) {
          setCurrentUserIndex((prev) => prev + 1);
          form.reset({ rating: 0, comments: '' });
        } else {
          handleClose();
        }
      } else {
        toast.error(result.message || 'Error al enviar la calificación');
      }
    },
    onError: () => {
      toast.error('Error al enviar la calificación');
    },
  });

  const handleClose = () => {
    setCurrentUserIndex(0);
    setCompletedReviews(new Set());
    form.reset();
    onClose();
  };

  const handleSkip = () => {
    if (hasMoreUsers) {
      setCurrentUserIndex((prev) => prev + 1);
      form.reset({ rating: 0, comments: '' });
    } else {
      handleClose();
    }
  };

  const onSubmit = (values: ReviewFormValues) => {
    mutation.mutate(values);
  };

  if (!currentUser) {
    return null;
  }

  const userInitials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleText =
    currentUser.role === 'DRIVER'
      ? 'conductor'
      : 'pasajero';

  const rating = form.watch('rating');
  const comments = form.watch('comments') || '';
  const characterCount = comments.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Califica tu experiencia
          </DialogTitle>
          <DialogDescription>
            {completedReviews.size > 0 && (
              <span className="text-green-600 font-medium">
                ✓ {completedReviews.size}{' '}
                {completedReviews.size === 1 ? 'calificación enviada' : 'calificaciones enviadas'}
              </span>
            )}
            {hasMoreUsers && (
              <span className="text-slate-500">
                {' • '}
                {currentUserIndex + 1} de {reviewableUsers.length}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* User Info */}
        <div className="flex items-center gap-4 py-2">
          <Avatar className="h-16 w-16 border-2 border-slate-200">
            <AvatarImage src={currentUser.image || undefined} alt={currentUser.name} />
            <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-lg">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">
              {currentUser.name}
            </h3>
            <p className="text-sm text-slate-600">
              Califica tu experiencia con este {roleText}
            </p>
          </div>
        </div>

        <Separator />

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Calificación *
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                        >
                          {star <= rating ? '⭐' : '☆'}
                        </button>
                      ))}
                      {rating > 0 && (
                        <span className="ml-2 text-sm font-medium text-slate-700">
                          {rating} de 5
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comments */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Comentarios (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comparte tu experiencia..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between text-xs">
                    <FormMessage />
                    <span
                      className={
                        characterCount > 200
                          ? 'text-red-600 font-medium'
                          : 'text-slate-500'
                      }
                    >
                      {characterCount}/200
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
                disabled={mutation.isPending}
              >
                {hasMoreUsers ? 'Omitir' : 'Cerrar'}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending || rating === 0}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {hasMoreUsers ? 'Siguiente' : 'Enviar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
