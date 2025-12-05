import { Suspense } from 'react'


import { getFuelPrices } from '@/actions/fuel-price/get-fuel-prices'
import Header from '@/components/header/header'

import { CreateFuelPriceButton } from './components/CreateFuelPriceButton'
import { FuelPriceFilters } from './components/FuelPriceFilters'
import { FuelPriceTable } from './components/FuelPriceTable'
import Loading from './loading'
import { DashboardShell } from '../usuarios/components/DashboardShell'
import { Pagination } from '../usuarios/components/Pagination'

import type { FuelType } from '@prisma/client'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Precios de Combustibles | Admin - Tengo Lugar',
  description: 'Gestiona los precios de combustibles del sistema',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    fuelType?: string
    isActive?: string
    search?: string
  }>
}

export default async function AdminFuelPricesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const fuelType = params.fuelType as FuelType | undefined
  const isActive = params.isActive === 'true' ? true : params.isActive === 'false' ? false : undefined
  const searchTerm = params.search || ''

  const response = await getFuelPrices({
    page,
    pageSize,
    fuelType,
    isActive,
    searchTerm,
  })

  if (!response.success) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Precios de Combustibles' },
          ]}
        />
        <DashboardShell>
          <div className="grid gap-1 px-2 mb-6">
            <h1 className="text-2xl font-bold tracking-wide text-primary">Precios de Combustibles</h1>
            <p className="text-muted-foreground">Gestiona los precios de combustibles del sistema.</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive font-semibold">{response.message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ocurrió un error al cargar los precios. Por favor, intenta nuevamente.
            </p>
          </div>
        </DashboardShell>
      </>
    )
  }

  const { fuelPrices, pagination } = response.data!

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Precios de Combustibles' },
        ]}
      />
      <DashboardShell>
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-wide text-primary">Precios de Combustibles</h1>
            <p className="text-muted-foreground">Gestiona y actualiza los precios de combustibles del sistema.</p>
          </div>
          <CreateFuelPriceButton />
        </div>

        <FuelPriceFilters />

        <Suspense fallback={<Loading />}>
          <FuelPriceTable fuelPrices={fuelPrices} />
        </Suspense>

        <Pagination
          total={pagination.total}
          pageCount={pagination.totalPages}
          currentPage={pagination.page}
          pageSize={pagination.pageSize}
          urlBased={true}
          totalLabel="Precios"
        />
      </DashboardShell>
    </>
  )
}
