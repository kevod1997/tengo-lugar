import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Trip } from "@/types/trip-types"

import { TripList } from "./TripList"

interface SearchResultsProps {
    originCity?: string
    destinationCity?: string
    date?: string
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
    date,
    pagination,
    currentPage,
    pageSize
}: SearchResultsProps) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className={`${trips.length === 0 && 'text-center'}`}>
                    {trips.length > 0
                        ? `Viajes de ${originCity} a ${destinationCity}`
                        : 'No se encontraron viajes'}
                </CardTitle>
                {trips.length > 0 && (
                    <p className="text-muted-foreground">
                        {/* Se encontraron {pagination.total} viajes */}
                        {date && (
                            <span className="text-sm text-muted-foreground">
                                {`Para el ${format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: es })}`}
                            </span>
                        )}
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
        <div className="py-2 text-center">
            <p className="text-lg mb-4">No hay viajes disponibles con esos criterios de búsqueda.</p>
            <p className="text-sm text-muted-foreground">Intenta modificar tu búsqueda o buscar en fechas diferentes.</p>
        </div>
    )
}