"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LifeBuoy, CheckCircle2, Clock, User } from 'lucide-react'

interface TicketMetricsProps {
  metrics: {
    total: number
    open: number
    resolved: number
    assignedToMe: number
  }
}

export function TicketMetrics({ metrics }: TicketMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <LifeBuoy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total}</div>
          <p className="text-xs text-muted-foreground">Todos los tickets del sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.open}</div>
          <p className="text-xs text-muted-foreground">Pendientes de resolución</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.resolved}</div>
          <p className="text-xs text-muted-foreground">Tickets completados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Asignados a mí</CardTitle>
          <User className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.assignedToMe}</div>
          <p className="text-xs text-muted-foreground">Mis tickets</p>
        </CardContent>
      </Card>
    </div>
  )
}
