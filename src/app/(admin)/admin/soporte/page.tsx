import { Suspense } from 'react'

import { TicketStatus } from '@prisma/client'

import { getAllTickets } from '@/actions/support/get-all-tickets'
import Header from '@/components/header/header'

import { TicketFilters } from './components/TicketFilters'
import { TicketMetrics } from './components/TicketMetrics'
import { TicketTable } from './components/TicketTable'
import { DashboardHeader } from '../usuarios/components/DashboardHeader'
import { DashboardShell } from '../usuarios/components/DashboardShell'
import { Pagination } from '../usuarios/components/Pagination'

import type { TicketCategory } from '@prisma/client';

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    status?: TicketStatus
    category?: TicketCategory
    assignedToMe?: string
    search?: string
  }>
}

export default async function SoportePage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10

  const filters = {
    page,
    pageSize,
    status: params.status || TicketStatus.OPEN, // Por defecto mostrar solo tickets abiertos
    category: params.category,
    assignedToMe: params.assignedToMe === 'true',
    search: params.search
  }

  const response = await getAllTickets(filters)

  if (!response.success || !response.data) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Soporte' },
          ]}
        />
        <DashboardShell>
          <div className="text-center py-8">
            <p className="text-red-500">Error al cargar tickets: {response.message}</p>
          </div>
        </DashboardShell>
      </>
    )
  }

  const { tickets, metrics, pagination } = response.data

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Soporte' },
        ]}
      />
      <DashboardShell>
        <DashboardHeader
          heading="Gestión de Tickets de Soporte"
          text="Administra y resuelve tickets de soporte de usuarios."
        />

        <TicketMetrics metrics={metrics} />

        <TicketFilters />

        <Suspense fallback={<div>Cargando tickets...</div>}>
          <TicketTable tickets={tickets} />
        </Suspense>

        <Pagination
          total={pagination.totalItems}
          pageCount={pagination.totalPages}
          currentPage={pagination.page}
          pageSize={pagination.pageSize}
          urlBased={true}
          totalLabel="Tickets"
        />
      </DashboardShell>
    </>
  )
}
