import { Suspense } from 'react'
import { Metadata } from 'next'
import Header from '@/components/header/header'
import { DashboardShell } from '../usuarios/components/DashboardShell'
import { DashboardHeader } from '../usuarios/components/DashboardHeader'
import { Pagination } from '../usuarios/components/Pagination'
import { BankAccountTable } from './components/BankAccountTable'
import { BankAccountFilters } from './components/BankAccountFilters'
import Loading from './loading'
import { getBankAccounts } from '@/actions/admin/bank-account/get-bank-accounts'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Gestión de Datos Bancarios | Admin - Tengo Lugar',
  description: 'Verifica y administra los datos bancarios de los usuarios',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    isVerified?: string
    search?: string
  }>
}

export default async function AdminBankAccountsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const isVerified = (params.isVerified as 'ALL' | 'true' | 'false') || 'ALL'
  const searchTerm = params.search || ''

  const response = await getBankAccounts({
    page,
    pageSize,
    isVerified,
    searchTerm,
  })

  if (!response.success) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Datos Bancarios' },
          ]}
        />
        <DashboardShell>
          <DashboardHeader
            heading="Gestión de Datos Bancarios"
            text="Verifica y administra los datos bancarios de los usuarios."
          />
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive font-semibold">{response.message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ocurrió un error al cargar las cuentas bancarias. Por favor, intenta nuevamente.
            </p>
          </div>
        </DashboardShell>
      </>
    )
  }

  const { bankAccounts, pagination } = response.data!

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Datos Bancarios' },
        ]}
      />
      <DashboardShell>
        <DashboardHeader
          heading="Gestión de Datos Bancarios"
          text="Verifica y administra los datos bancarios de los usuarios."
        />

        <BankAccountFilters />

        <Suspense fallback={<Loading />}>
          <BankAccountTable bankAccounts={bankAccounts} />
        </Suspense>

        <Pagination
          total={pagination.total}
          pageCount={pagination.totalPages}
          currentPage={pagination.page}
          pageSize={pagination.pageSize}
          urlBased={true}
          totalLabel="Cuentas bancarias"
        />
      </DashboardShell>
    </>
  )
}
