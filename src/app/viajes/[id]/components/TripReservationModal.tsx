'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createTripReservation } from '@/actions/trip/create-trip-reservation'
import { useAsyncLoading } from '@/hooks/ui/useAsyncLoading'
import { LoadingButton } from '@/components/ui/loading-button'

// Define the schema for trip reservation
const reservationSchema = z.object({
  seatsReserved: z.coerce.number().min(1, "Debe reservar al menos 1 asiento").max(4, "No puede reservar más de 4 asientos"),
  reservationMessage: z.string().max(500, "El mensaje no puede exceder los 500 caracteres").optional(),
})

type ReservationFormValues = z.infer<typeof reservationSchema>

interface TripReservationModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
  basePrice: number
  availableSeats: number
  serviceFeeRate: number // Service fee percentage (0-100)
}

export function TripReservationModal({
  isOpen,
  onClose,
  tripId,
  basePrice,
  availableSeats,
  serviceFeeRate
}: TripReservationModalProps) {
  const [totalPrice, setTotalPrice] = useState(basePrice)
  const [serviceFee, setServiceFee] = useState(0)
  const [subtotal, setSubtotal] = useState(basePrice)
  const { executeWithLoading } = useAsyncLoading();

  // Create form
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      seatsReserved: 1,
      reservationMessage: '',
    },
  })

  // Watch for changes in seats to recalculate price
  const seatsReserved = form.watch('seatsReserved')

  // Calculate prices when seats change
  useEffect(() => {
    const seats = seatsReserved || 1
    const seatSubtotal = basePrice * seats
    const fee = Math.round(seatSubtotal * (serviceFeeRate / 100))

    setSubtotal(seatSubtotal)
    setServiceFee(fee)
    setTotalPrice(seatSubtotal + fee)
  }, [seatsReserved, basePrice, serviceFeeRate])

  const onSubmit = async (data: ReservationFormValues) => {
    const result = await executeWithLoading(
      'creatingReservation',
      async () => {
        return await createTripReservation({
          tripId,
          seatsReserved: data.seatsReserved,
          reservationMessage: data.reservationMessage || undefined,
          totalPrice
        });
      },
      {
        showToastOnError: true,
        errorMessage: 'Error al realizar la reserva'
      }
    );

    if (result?.success) {
      toast.success('Reserva enviada correctamente');
      onClose();
    }
  }

  // Generate available seat options
  const seatOptions = Array.from({ length: Math.min(availableSeats, 4) }, (_, i) => i + 1)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reservar asientos</DialogTitle>
          <DialogDescription>
            Complete los detalles para reservar sus asientos en este viaje
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="seatsReserved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de asientos</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione cantidad de asientos" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {seatOptions.map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'asiento' : 'asientos'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione cuántos asientos desea reservar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reservationMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje para el conductor (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe un mensaje para el conductor..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Puede enviar un mensaje al conductor con información adicional
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4 bg-slate-50">
              <h4 className="font-medium mb-2">Desglose de precios</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Precio por asiento</span>
                  <span>${basePrice}</span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal ({seatsReserved} {seatsReserved === 1 ? 'asiento' : 'asientos'})</span>
                  <span>${subtotal}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Cargo por servicio ({serviceFeeRate}%)</span>
                  <span>${serviceFee}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <LoadingButton
                type="submit"
                operation="creatingReservation"
                loadingText="Procesando reserva..."
              >
                Confirmar reserva
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}