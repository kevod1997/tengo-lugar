import { Skeleton } from '@/components/ui/skeleton'
import { DashboardShell } from '../usuarios/components/DashboardShell'
import { DashboardHeader } from '../usuarios/components/DashboardHeader'

export default function Loading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Pagos a Conductores"
        text="Cargando pagos..."
      />

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-8 w-full mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
    </DashboardShell>
  )
}
