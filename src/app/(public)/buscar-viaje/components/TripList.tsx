// app/(public)/viajes/components/trip-list.tsx
import { Trip } from '@/types/trip-types'
import { Pagination } from '../../../(admin)/admin/usuarios/components/Pagination'
import { TripCard } from './TripCard'

interface TripListProps {
  trips: Trip[]
  pagination: {
    total: number
    pageCount: number
  }
  currentPage: number
  pageSize: number
}

export function TripList({ trips, pagination, currentPage, pageSize }: TripListProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      <div className="mt-6">
        <Pagination
          total={pagination.total}
          pageCount={pagination.pageCount}
          currentPage={currentPage}
          pageSize={pageSize}
          urlBased={true}
          totalLabel={
            trips.length > 1 ? 'Viajes' : 'Viaje'
          }
        />
      </div>
    </>
  )
}