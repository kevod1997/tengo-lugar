"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { resolveTicket } from "@/actions/support/resolve-ticket"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { resolveTicketSchema, type ResolveTicketInput } from "@/schemas/validation/support-ticket-schema"





interface ResolveTicketFormProps {
  ticketId: string
  isResolved: boolean
}

export function ResolveTicketForm({ ticketId, isResolved }: ResolveTicketFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ResolveTicketInput>({
    resolver: zodResolver(resolveTicketSchema),
    defaultValues: {
      ticketId,
      resolution: ""
    }
  })

  const onSubmit = async (data: ResolveTicketInput) => {
    setIsSubmitting(true)
    try {
      const response = await resolveTicket(data)

      if (response.success) {
        toast.success(response.message || "Ticket resuelto exitosamente")
        router.refresh()
        form.reset()
      } else {
        toast.error(response.message || "Error al resolver el ticket")
      }
    } catch (error) {
      toast.error("Error inesperado al resolver el ticket")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isResolved) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-700">
          Este ticket ya ha sido resuelto.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="resolution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resolución del Ticket</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe cómo se resolvió el problema del usuario..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Mínimo 10 caracteres, máximo 500. Esta resolución será visible para el usuario.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resolver Ticket
        </Button>
      </form>
    </Form>
  )
}
