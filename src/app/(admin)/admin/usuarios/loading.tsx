import { Skeleton } from '@/components/ui/skeleton'
import { DashboardShell } from './components/DashboardShell'
import { DashboardHeader } from './components/DashboardHeader'

export default function Loading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Cargando..." />
      <div className="divide-border-200 divide-y rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}

