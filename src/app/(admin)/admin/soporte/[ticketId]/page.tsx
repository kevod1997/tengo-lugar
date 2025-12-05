import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'

import { getTicketDetailAdmin } from '@/actions/support/get-all-tickets'
import Header from '@/components/header/header'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'

import { ResolveTicketForm } from './components/ResolveTicketForm'
import { TicketDetailCard } from './components/TicketDetailCard'
import { DashboardHeader } from '../../usuarios/components/DashboardHeader'
import { DashboardShell } from '../../usuarios/components/DashboardShell'



export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    ticketId: string
  }>
}

export default async function TicketDetailPage({ params }: PageProps) {
  // Get current admin session
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== 'admin') {
    redirect('/admin')
  }

  const { ticketId } = await params

  const response = await getTicketDetailAdmin(ticketId)

  if (!response.success || !response.data?.ticket) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Soporte', href: '/admin/soporte' },
            { label: 'Ticket no encontrado' },
          ]}
        />
        <DashboardShell>
          <div className="text-center py-8">
            <p className="text-red-500">Error: {response.message || 'Ticket no encontrado'}</p>
            <Link href="/admin/soporte">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a tickets
              </Button>
            </Link>
          </div>
        </DashboardShell>
      </>
    )
  }

  const { ticket } = response.data

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Soporte', href: '/admin/soporte' },
          { label: ticket.ticketNumber },
        ]}
      />
      <DashboardShell>
        <div className="flex items-center justify-between">
          <DashboardHeader
            heading={`Ticket: ${ticket.ticketNumber}`}
            text="Detalles completos del ticket de soporte."
          />
          <Link href="/admin/soporte">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TicketDetailCard ticket={ticket} currentUserId={session.user.id} />
          </div>

          <div>
            <div className="sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Resolver Ticket</h3>
              <ResolveTicketForm ticketId={ticket.id} isResolved={ticket.status === 'RESOLVED'} />
            </div>
          </div>
        </div>
      </DashboardShell>
    </>
  )
}
