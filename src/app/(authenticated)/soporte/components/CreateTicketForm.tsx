'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/validation/support-ticket-schema'
import { createSupportTicket } from '@/actions/support/create-support-ticket'
import { TicketCategorySelect } from './TicketCategorySelect'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Send, AlertCircle } from 'lucide-react'

interface CreateTicketFormProps {
  onSuccess?: () => void
}

export function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const [phoneVerificationError, setPhoneVerificationError] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: undefined,
      subject: '',
      description: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Ticket creado exitosamente')
        form.reset()
        setPhoneVerificationError(false)
        queryClient.invalidateQueries({ queryKey: ['user-tickets'] })
        onSuccess?.()
      } else {
        console.log("Error al crear el ticket:", response);
        // Check if error is phone verification
        if (response.message?.includes('verificar tu número de teléfono')) {
          setPhoneVerificationError(true)
          toast.error('Debes verificar tu teléfono antes de crear un ticket')
        } else {
          toast.error(response.message || 'Error al crear el ticket')
        }
      }
    },
    onError: () => {
      toast.error('Error inesperado al crear el ticket')
    },
  })

  const onSubmit = (data: CreateTicketInput) => {
    setPhoneVerificationError(false)
    mutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {phoneVerificationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para crear tickets de soporte, primero debes verificar tu número de teléfono.{' '}
              <a href="/perfil" className="underline font-medium">
                Ir a mi perfil
              </a>
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <FormControl>
                <TicketCategorySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asunto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Resume tu problema en pocas palabras"
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value.length}/100 caracteres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe tu problema con el mayor detalle posible. Incluye fechas, números de ticket, y cualquier información relevante."
                  className="min-h-[150px] resize-none"
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value.length}/1000 caracteres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando ticket...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar ticket
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
