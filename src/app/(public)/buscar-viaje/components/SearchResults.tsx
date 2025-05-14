// app/(public)/viajes/components/search-results.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trip } from "@/types/trip-types"
import { TripList } from "./TripList"

interface SearchResultsProps {
    originCity?: string
    destinationCity?: string
    trips: Trip[]
    pagination: {
        total: number
        pageCount: number
    }
    currentPage: number
    pageSize: number
}

export function SearchResults({
    originCity,
    destinationCity,
    trips,
    pagination,
    currentPage,
    pageSize
}: SearchResultsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {trips.length > 0
                        ? `Viajes de ${originCity} a ${destinationCity}`
                        : 'No se encontraron viajes'}
                </CardTitle>
                {trips.length > 0 && (
                    <p className="text-muted-foreground">
                        Se encontraron {pagination.total} viajes
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {trips.length > 0 ? (
                    <TripList
                        trips={trips}
                        pagination={pagination}
                        currentPage={currentPage}
                        pageSize={pageSize}
                    />
                ) : (
                    <NoTripsMessage />
                )}
            </CardContent>
        </Card>
    )
}

export function NoTripsMessage() {
    return (
        <div className="py-8 text-center">
            <p className="text-lg mb-4">No hay viajes disponibles con esos criterios de búsqueda.</p>
            <p className="text-muted-foreground">Intenta modificar tu búsqueda o buscar en fechas diferentes.</p>
        </div>
    )
}