import { Suspense } from 'react'
import { Metadata } from 'next'
import Header from '@/components/header/header'
import { DashboardShell } from '../usuarios/components/DashboardShell'
import { DashboardHeader } from '../usuarios/components/DashboardHeader'
import { Pagination } from '../usuarios/components/Pagination'
import { DriverPayoutTableWrapper } from './components/DriverPayoutTableWrapper'
import { DriverPayoutFilters } from './components/DriverPayoutFilters'
import Loading from './loading'
import { getDriverPayouts } from '@/actions/driver-payout/get-driver-payouts'
import { PayoutStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Pagos a Conductores | Admin - Tengo Lugar',
  description: 'Gestiona los pagos pendientes para los conductores',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    status?: string
    search?: string
  }>
}

export default async function AdminDriverPayoutsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const status = (params.status as PayoutStatus) || undefined
  const searchTerm = params.search || ''

  const response = await getDriverPayouts({
    page,
    pageSize,
    status: status || 'ALL',
    searchTerm,
  })

    console.log(response)

  if (!response.success) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Pagos a Conductores' },
          ]}
        />
        <DashboardShell>
          <DashboardHeader
            heading="Pagos a Conductores"
            text="Gestiona los pagos pendientes para los conductores."
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

  const { payouts, pagination } = response.data!

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Pagos a Conductores' },
        ]}
      />
      <DashboardShell>
        <DashboardHeader
          heading="Pagos a Conductores"
          text="Gestiona y procesa los pagos pendientes para los conductores que han completado viajes."
        />

        <DriverPayoutFilters />

        <Suspense fallback={<Loading />}>
          <DriverPayoutTableWrapper payouts={payouts} />
        </Suspense>

        <Pagination
          total={pagination.totalItems}
          pageCount={pagination.totalPages}
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          urlBased={true}
          totalLabel="Pagos"
        />
      </DashboardShell>
    </>
  )
}
