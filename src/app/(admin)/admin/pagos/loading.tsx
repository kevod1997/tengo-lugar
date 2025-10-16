import { Skeleton } from '@/components/ui/skeleton'
import { DashboardShell } from '../usuarios/components/DashboardShell'
import { DashboardHeader } from '../usuarios/components/DashboardHeader'
import Header from '@/components/header/header'

export default function Loading() {
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

        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[200px]" />
        </div>

        {/* Table skeleton */}
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between px-2 mt-4">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center space-x-6">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </DashboardShell>
    </>
  )
}
