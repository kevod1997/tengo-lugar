import { searchTrips, TripSearchParams } from '@/actions/trip/search-trips'
import Header from '@/components/header/header'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaExclamationTriangle } from 'react-icons/fa'
import TripSearchForm from './components/TripSearchForm'
import { SearchResults } from './components/SearchResults'
import TechnicalProblemsPage from '@/components/TechnicalProblems'
import { getGoogleMapsConfig } from '@/services/env/env-service'

interface SearchTripsPageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    originCity?: string
    destinationCity?: string
    date?: string
    passengers?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function SearchTripsPage({ searchParams }: SearchTripsPageProps) {
  const params = await searchParams
  const googleMaps = await getGoogleMapsConfig()

  if (!googleMaps.available) {
    return <TechnicalProblemsPage reason="search_unavailable" />
  }
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10

  // Convert search params to the format expected by the server action
  const searchParamsForAction: TripSearchParams = {
    page,
    pageSize,
    originCity: params.originCity,
    destinationCity: params.destinationCity,
    date: params.date,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    status: 'ACTIVE'
  }

  // Only execute search if some search parameters were provided
  const hasSearchParams = params.originCity || params.destinationCity || params.date
  const response = hasSearchParams ? await searchTrips(searchParamsForAction) : null

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Buscar Viajes' },
        ]}
      />
        {/* Search Form */}
        <div className="page-content">
          <div className="mb-8">
            <TripSearchForm
              apiKey={googleMaps.apiKey!}
              initialValues={{
                origin: params.originCity,
                destination: params.destinationCity,
                date: params.date,
                passengers: params.passengers
              }}
            />
          </div>

          {/* Results Content */}
          {hasSearchParams && response?.success && response.data ? (
            <SearchResults
              originCity={params.originCity}
              destinationCity={params.destinationCity}
              date={params.date}
              trips={response.data.trips}
              pagination={response.data.pagination}
              currentPage={page}
              pageSize={pageSize}
            />
          ) : !hasSearchParams ? (
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Busca tu próximo viaje</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Usa el formulario de búsqueda para encontrar viajes disponibles</p>
              </CardContent>
            </Card>
          ) : (
            <Alert variant="destructive">
              <FaExclamationTriangle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar los viajes: {response?.error?.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
    </>
  )
}