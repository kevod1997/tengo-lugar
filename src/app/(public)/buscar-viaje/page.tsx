// import { searchTrips, TripSearchParams } from '@/actions/trip/search-trips'
// // import { formatDatetoLocaleDateString } from '@/utils/format/formatDate'
// import { Pagination } from '../../(admin)/admin/usuarios/components/Pagination'
// import TripSearchForm from './components/TripSearchForm'
// import Header from '@/components/header/header'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from "@/components/ui/table"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { FaExclamationTriangle } from 'react-icons/fa'
// import { format } from 'date-fns'
// import { es } from 'date-fns/locale'

// interface SearchTripsPageProps {
//   searchParams: Promise<{
//     page?: string
//     pageSize?: string
//     originCity?: string
//     destinationCity?: string
//     date?: string
//     passengers?: string
//     minPrice?: string
//     maxPrice?: string
//   }>
// }

// export default async function SearchTripsPage({ searchParams }: SearchTripsPageProps) {
//   const params = await searchParams
//   const page = Number(params.page) || 1
//   const pageSize = Number(params.pageSize) || 10

//   // Convert search params to the format expected by the server action
//   const searchParamsForAction: TripSearchParams = {
//     page,
//     pageSize,
//     originCity: params.originCity,
//     destinationCity: params.destinationCity,
//     date: params.date,
//     minPrice: params.minPrice ? Number(params.minPrice) : undefined,
//     maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
//     status: 'ACTIVE'
//   }

//   // Only execute search if some search parameters were provided
//   const hasSearchParams = params.originCity || params.destinationCity || params.date
//   const response = hasSearchParams ? await searchTrips(searchParamsForAction) : null

//   return (
//     <div className="container mx-auto pb-8 px-4 md:px-6">
//       <Header
//         breadcrumbs={[
//           { label: 'Inicio', href: '/' },
//           { label: 'Buscar Viajes' },
//         ]}
//       />

//       {/* Search Form */}
//       <div className="mb-8">
//         <TripSearchForm
//           initialValues={{
//             origin: params.originCity,
//             destination: params.destinationCity,
//             date: params.date,
//             passengers: params.passengers
//           }}
//         />
//       </div>

//       {/* Results Content */}
//       {hasSearchParams && response?.success && response.data ? (
//         <>
//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 {response.data.trips.length > 0
//                   ? `Viajes de ${params.originCity} a ${params.destinationCity}`
//                   : 'No se encontraron viajes'}
//               </CardTitle>
//               {response.data.trips.length > 0 && (
//                 <p className="text-muted-foreground">
//                   Se encontraron {response.data.pagination.total} viajes
//                 </p>
//               )}
//             </CardHeader>
//             <CardContent>
//               {response.data.trips.length > 0 ? (
//                 <>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Origen</TableHead>
//                         <TableHead>Destino</TableHead>
//                         <TableHead>Horario</TableHead>
//                         <TableHead>Precio</TableHead>
//                         <TableHead>Asientos</TableHead>
//                         <TableHead>Acciones</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {response.data.trips.map((trip) => (
//                         <TableRow key={trip.id}>
//                           <TableCell>{trip.originCity}</TableCell>
//                           <TableCell>{trip.destinationCity}</TableCell>
//                           <TableCell>{
//                             format(new Date(trip.departureTime), 'HH:mm', { locale: es })
//                           }</TableCell>
//                           <TableCell>${trip.price}</TableCell>
//                           <TableCell>{trip.availableSeats}</TableCell>
//                           <TableCell>
//                             <a
//                               href={`/viajes/${trip.id}`}
//                               className="text-primary hover:underline"
//                             >
//                               Ver detalles
//                             </a>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>

//                   <div className="mt-6">
//                     <Pagination
//                       total={response.data.pagination.total}
//                       pageCount={response.data.pagination.pageCount}
//                       currentPage={page}
//                       pageSize={pageSize}
//                       urlBased={true}
//                       totalLabel="Viajes"
//                     />
//                   </div>
//                 </>
//               ) : (
//                 <div className="py-8 text-center">
//                   <p className="text-lg mb-4">No hay viajes disponibles con esos criterios de búsqueda.</p>
//                   <p className="text-muted-foreground">Intenta modificar tu búsqueda o buscar en fechas diferentes.</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </>
//       ) : !hasSearchParams ? (
//         <Card className="text-center">
//           <CardHeader>
//             <CardTitle>Busca tu próximo viaje</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground">Usa el formulario de búsqueda para encontrar viajes disponibles</p>
//           </CardContent>
//         </Card>
//       ) : (
//         <Alert variant="destructive">
//           <FaExclamationTriangle className="h-4 w-4" />
//           <AlertDescription>
//             Error al cargar los viajes: {response?.error?.message}
//           </AlertDescription>
//         </Alert>
//       )}
//     </div>
//   )
// }

// app/(public)/viajes/page.tsx
import { searchTrips, TripSearchParams } from '@/actions/trip/search-trips'
import Header from '@/components/header/header'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaExclamationTriangle } from 'react-icons/fa'
import TripSearchForm from './components/TripSearchForm'
import { SearchResults } from './components/SearchResults'

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
    <div className="container mx-auto pb-8 px-4 md:px-6">
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Buscar Viajes' },
        ]}
      />

      {/* Search Form */}
      <div className="mb-8">
        <TripSearchForm
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
  )
}