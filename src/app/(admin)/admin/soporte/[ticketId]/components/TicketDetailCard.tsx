"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Mail, Phone, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { assignTicketToSelf } from "@/actions/support/resolve-ticket"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { TicketStatus, TicketCategory } from "@prisma/client"

interface TicketDetailCardProps {
  ticket: {
    id: string
    ticketNumber: string
    category: TicketCategory
    subject: string
    description: string
    status: TicketStatus
    resolution: string | null
    createdAt: Date
    resolvedAt: Date | null
    user: {
      id: string
      name: string
      email: string
      phoneNumber: string | null
      phoneNumberVerified: boolean
    }
    assignedAdmin: {
      id: string
      name: string
      email: string
    } | null
  }
  currentUserId: string
}

const statusLabels: Record<TicketStatus, string> = {
  OPEN: "Abierto",
  RESOLVED: "Resuelto"
}

const categoryLabels: Record<TicketCategory, string> = {
  PAYMENT_ISSUE: "Problema de pago",
  TRIP_ISSUE: "Problema de viaje",
  ACCOUNT_ISSUE: "Problema de cuenta",
  OTHER: "Otro"
}

export function TicketDetailCard({ ticket, currentUserId }: TicketDetailCardProps) {
  const router = useRouter()
  const [isAssigning, setIsAssigning] = useState(false)

  const handleAssignToSelf = async () => {
    setIsAssigning(true)
    try {
      const response = await assignTicketToSelf(ticket.id)
      if (response.success) {
        toast.success("Ticket asignado exitosamente")
        router.refresh()
      } else {
        toast.error(response.message || "Error al asignar ticket")
      }
    } catch (error) {
      toast.error("Error inesperado")
      console.error(error)
    } finally {
      setIsAssigning(false)
    }
  }

  const openWhatsApp = () => {
    if (ticket.user.phoneNumber) {
      const cleanPhone = ticket.user.phoneNumber.replace(/\D/g, '')
      const message = encodeURIComponent(`Hola ${ticket.user.name}, te contacto sobre tu ticket ${ticket.ticketNumber}.`)
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
    }
  }

  const isAssignedToCurrentUser = ticket.assignedAdmin?.id === currentUserId

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{ticket.ticketNumber}</CardTitle>
              <CardDescription>{ticket.subject}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
                {ticket.status === 'OPEN' ? (
                  <Clock className="mr-1 h-3 w-3" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                )}
                {statusLabels[ticket.status]}
              </Badge>
              <Badge variant="outline">{categoryLabels[ticket.category]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Descripción del problema</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Creado el {format(new Date(ticket.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</span>
          </div>

          {ticket.resolvedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Resuelto el {format(new Date(ticket.resolvedAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{ticket.user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${ticket.user.email}`} className="text-sm text-blue-600 hover:underline">
              {ticket.user.email}
            </a>
          </div>
          {ticket.user.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{ticket.user.phoneNumber}</span>
              {ticket.user.phoneNumberVerified && (
                <Badge variant="outline" className="text-xs">Verificado</Badge>
              )}
              <Button size="sm" variant="outline" onClick={openWhatsApp}>
                Contactar por WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asignación</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.assignedAdmin ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Asignado a:</span>{" "}
                <span className="font-medium">{ticket.assignedAdmin.name}</span>
              </p>
              {isAssignedToCurrentUser && (
                <Badge variant="secondary">Este ticket te pertenece</Badge>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Este ticket no está asignado a ningún administrador.</p>
              <Button size="sm" onClick={handleAssignToSelf} disabled={isAssigning}>
                Asignarme este ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Card - only if resolved */}
      {ticket.resolution && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Resolución</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{ticket.resolution}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
