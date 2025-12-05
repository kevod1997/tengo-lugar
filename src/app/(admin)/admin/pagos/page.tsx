import { Suspense } from 'react'


import { getPendingPayments } from '@/actions/payment/get-pending-payments'
import Header from '@/components/header/header'

import { PaymentFilters } from './components/PaymentFilters'
import { PaymentTable } from './components/PaymentTable'
import Loading from './loading'
import { DashboardHeader } from '../usuarios/components/DashboardHeader'
import { DashboardShell } from '../usuarios/components/DashboardShell'
import { Pagination } from '../usuarios/components/Pagination'

import type { PaymentStatus } from '@prisma/client'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Gestión de Pagos | Admin - Tengo Lugar',
  description: 'Administra y verifica los pagos de las reservas',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    status?: string
    search?: string
  }>
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const status = (params.status as PaymentStatus) || undefined
  const searchTerm = params.search || ''

  const response = await getPendingPayments({
    page,
    pageSize,
    status: status || 'ALL',
    searchTerm,
  })


  if (!response.success) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Pagos' },
          ]}
        />
        <DashboardShell>
          <DashboardHeader
            heading="Gestión de Pagos"
            text="Administra y verifica los pagos de las reservas."
          />
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive font-semibold">{response.message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ocurrió un error al cargar los pagos. Por favor, intenta nuevamente.
            </p>
          </div>
        </DashboardShell>
      </>
    )
  }

  const { payments, pagination } = response.data!

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Pagos' },
        ]}
      />
      <DashboardShell>
        <DashboardHeader
          heading="Gestión de Pagos"
          text="Administra y verifica los pagos de las reservas."
        />

        <PaymentFilters />

        <Suspense fallback={<Loading />}>
          <PaymentTable payments={payments} />
        </Suspense>

        <Pagination
          total={pagination.total}
          pageCount={pagination.totalPages}
          currentPage={pagination.page}
          pageSize={pagination.pageSize}
          urlBased={true}
          totalLabel="Pagos"
        />
      </DashboardShell>
    </>
  )
}
