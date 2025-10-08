"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { TicketStatus, TicketCategory } from "@prisma/client"

interface TicketTableProps {
  tickets: Array<{
    id: string
    ticketNumber: string
    category: TicketCategory
    subject: string
    status: TicketStatus
    createdAt: Date
    user: {
      id: string
      name: string
      email: string
    }
    assignedAdmin: {
      id: string
      name: string
    } | null
  }>
}

const statusLabels: Record<TicketStatus, string> = {
  OPEN: "Abierto",
  RESOLVED: "Resuelto"
}

const statusColors: Record<TicketStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default",
  RESOLVED: "secondary"
}

const categoryLabels: Record<TicketCategory, string> = {
  PAYMENT_ISSUE: "Problema de pago",
  TRIP_ISSUE: "Problema de viaje",
  ACCOUNT_ISSUE: "Problema de cuenta",
  OTHER: "Otro"
}

export function TicketTable({ tickets }: TicketTableProps) {
  const router = useRouter()

  if (tickets.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No se encontraron tickets con los filtros aplicados.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Asunto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{ticket.user.name}</span>
                  <span className="text-xs text-muted-foreground">{ticket.user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{categoryLabels[ticket.category]}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
              <TableCell>
                <Badge variant={statusColors[ticket.status]}>
                  {statusLabels[ticket.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.assignedAdmin ? (
                  <span className="text-sm">{ticket.assignedAdmin.name}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin asignar</span>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: es })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/soporte/${ticket.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
