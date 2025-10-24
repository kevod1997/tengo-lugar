'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateFuelPriceSchema, UpdateFuelPriceInput } from '@/schemas/validation/fuel-price-schema'
import { updateFuelPrice } from '@/actions/fuel-price/update-fuel-price'
import { FuelPriceListItem, fuelTypeLabels } from '@/types/fuel-price'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface EditFuelPriceDialogProps {
  fuelPrice: FuelPriceListItem
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function EditFuelPriceDialog({ fuelPrice, open, onSuccess, onCancel }: EditFuelPriceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateFuelPriceInput>({
    resolver: zodResolver(updateFuelPriceSchema),
    defaultValues: {
      id: fuelPrice.id,
      name: fuelPrice.name,
      fuelType: fuelPrice.fuelType,
      price: fuelPrice.price,
      effectiveDate: new Date(fuelPrice.effectiveDate),
      isActive: fuelPrice.isActive,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        id: fuelPrice.id,
        name: fuelPrice.name,
        fuelType: fuelPrice.fuelType,
        price: fuelPrice.price,
        effectiveDate: new Date(fuelPrice.effectiveDate),
        isActive: fuelPrice.isActive,
      })
    }
  }, [open, fuelPrice, form])

  const handleSubmit = async (data: UpdateFuelPriceInput) => {
    setIsSubmitting(true)

    try {
      const response = await updateFuelPrice(data)

      if (response.success) {
        toast.success(response.message)
        onSuccess()
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Error al actualizar precio de combustible')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Precio de Combustible</DialogTitle>
          <DialogDescription>
            Modifica los detalles del precio de combustible.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Nafta Super Q1 2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Combustible</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fuelTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (ARS)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Efectiva</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Precio activo
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      El precio estará visible y disponible en el sistema
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
