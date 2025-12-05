'use client'

import { useState } from 'react'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronUp, FileText, CreditCard, UserCircle, HelpCircle, Clock, CheckCircle2, Calendar } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type TicketStatus = 'OPEN' | 'RESOLVED'
type TicketCategory = 'PAYMENT_ISSUE' | 'TRIP_ISSUE' | 'ACCOUNT_ISSUE' | 'OTHER'

interface TicketCardProps {
  ticket: {
    id: string
    ticketNumber: string
    category: TicketCategory
    subject: string
    description: string
    status: TicketStatus
    resolution?: string | null
    createdAt: Date | string
    resolvedAt?: Date | string | null
    assignedAdmin?: {
      id: string
      name: string
    } | null
  }
}

const CATEGORY_CONFIG = {
  PAYMENT_ISSUE: {
    label: 'Problema de pago',
    icon: CreditCard,
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  TRIP_ISSUE: {
    label: 'Problema con viaje',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  },
  ACCOUNT_ISSUE: {
    label: 'Problema de cuenta',
    icon: UserCircle,
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  },
  OTHER: {
    label: 'Otro',
    icon: HelpCircle,
    color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  },
}

const STATUS_CONFIG = {
  OPEN: {
    label: 'Abierto',
    variant: 'default' as const,
    icon: Clock,
    color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  },
  RESOLVED: {
    label: 'Resuelto',
    variant: 'secondary' as const,
    icon: CheckCircle2,
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  },
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const categoryConfig = CATEGORY_CONFIG[ticket.category]
  const statusConfig = STATUS_CONFIG[ticket.status]
  const CategoryIcon = categoryConfig.icon
  const StatusIcon = statusConfig.icon

  const createdDate = typeof ticket.createdAt === 'string'
    ? new Date(ticket.createdAt)
    : ticket.createdAt

  const resolvedDate = ticket.resolvedAt
    ? (typeof ticket.resolvedAt === 'string' ? new Date(ticket.resolvedAt) : ticket.resolvedAt)
    : null

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={categoryConfig.color}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                {categoryConfig.label}
              </Badge>
              <Badge variant={statusConfig.variant} className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-mono">
                #{ticket.ticketNumber}
              </p>
              <h3 className="font-semibold text-lg mt-1">{ticket.subject}</h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                Creado el {format(createdDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Descripción</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {ticket.status === 'RESOLVED' && ticket.resolution && (
            <>
              <Separator />
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Resolución
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {ticket.resolution}
                </p>
                {ticket.assignedAdmin && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Resuelto por {ticket.assignedAdmin.name}
                    {resolvedDate && ` el ${format(resolvedDate, "d 'de' MMMM", { locale: es })}`}
                  </p>
                )}
              </div>
            </>
          )}

          {ticket.status === 'OPEN' && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Nuestro equipo está revisando tu solicitud. Te contactaremos pronto.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
