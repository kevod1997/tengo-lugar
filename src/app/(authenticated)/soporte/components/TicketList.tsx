'use client'

import { useQuery } from '@tanstack/react-query'
import { getUserTickets } from '@/actions/support/get-user-tickets'
import { TicketCard } from './TicketCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Inbox } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

type TicketStatus = 'OPEN' | 'RESOLVED'

export function TicketList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-tickets'],
    queryFn: async () => {
      const response = await getUserTickets()
      if (!response.success) {
        throw new Error(response.message || 'Error al cargar tickets')
      }
      return response.data
    },
    staleTime: 60 * 1000, // 1 minute
  })

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar tus tickets. Por favor, intenta nuevamente.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  const tickets = data?.tickets || []
  const openTickets = tickets.filter((t) => t.status === 'OPEN')
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED')

  const EmptyState = ({ status }: { status: TicketStatus }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">
        No hay tickets {status === 'OPEN' ? 'abiertos' : 'resueltos'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {status === 'OPEN'
          ? 'Tus tickets de soporte aparecerán aquí cuando los crees.'
          : 'Los tickets resueltos se mostrarán aquí.'}
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold">{data?.total || 0}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {data?.open || 0}
          </p>
          <p className="text-sm text-muted-foreground">Abiertos</p>
        </div>
        <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {data?.resolved || 0}
          </p>
          <p className="text-sm text-muted-foreground">Resueltos</p>
        </div>
      </div>

      {/* Tickets Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            Todos
            <Badge variant="secondary" className="ml-2">
              {tickets.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="open">
            Abiertos
            <Badge variant="secondary" className="ml-2">
              {openTickets.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resueltos
            <Badge variant="secondary" className="ml-2">
              {resolvedTickets.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {tickets.length === 0 ? (
            <EmptyState status="OPEN" />
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-4 mt-6">
          {openTickets.length === 0 ? (
            <EmptyState status="OPEN" />
          ) : (
            openTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          {resolvedTickets.length === 0 ? (
            <EmptyState status="RESOLVED" />
          ) : (
            resolvedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
