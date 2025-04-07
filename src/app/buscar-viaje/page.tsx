// import { searchTrips, TripSearchParams } from '@/actions/trip/search-trips'
// import { formatDatetoLocaleDateString } from '@/utils/format/formatDate'
// import { Pagination } from '../admin/usuarios/components/Pagination'
// import TripSearchForm from './components/trip-search-form'
// import Header from '@/components/header/header'

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

//   console.log('Search Trips Response:', response)

//   return (
//     <div className="container mx-auto pb-8 px-4 md:px-6">
//          <Header
//                         breadcrumbs={[
//                             { label: 'Home', href: '/' },
//                             { label: 'Buscar Viajes' },
//                         ]}
//                     />
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

//       {/* Results Header */}
//       {hasSearchParams && (
//         <h2 className="text-2xl font-bold mb-6">
//           {response?.success && response.data ? (
//             response.data.trips.length > 0 
//               ? `Viajes de ${params.originCity} a ${params.destinationCity}`
//               : 'No se encontraron viajes'
//           ) : (
//             'Error al buscar viajes'
//           )}
//         </h2>
//       )}

//       {/* Results Content */}
//       {hasSearchParams && response?.success && response.data ? (
//         <>
//           <div className="mb-4">
//             <p className="text-xl font-semibold">
//               {response.data.trips.length > 0
//                 ? `Se encontraron ${response.data.pagination.total} viajes`
//                 : 'No se encontraron viajes con esos criterios'}
//             </p>
//           </div>

//           {response.data.trips.length > 0 ? (
//             <>
//               <div className="mb-8">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="p-2 text-left">Origen</th>
//                       <th className="p-2 text-left">Destino</th>
//                       <th className="p-2 text-left">Fecha</th>
//                       <th className="p-2 text-left">Conductor</th>
//                       <th className="p-2 text-left">Precio</th>
//                       <th className="p-2 text-left">Asientos</th>
//                       <th className="p-2 text-left">Acciones</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {response.data.trips.map((trip) => (
//                       <tr key={trip.id} className="border-b hover:bg-gray-50">
//                         <td className="p-2">{trip.originCity}</td>
//                         <td className="p-2">{trip.destinationCity}</td>
//                         <td className="p-2">{formatDatetoLocaleDateString(trip.date)}</td>
//                         <td className="p-2">{trip.driverName}</td>
//                         <td className="p-2">${trip.price}</td>
//                         <td className="p-2">{trip.availableSeats}</td>
//                         <td className="p-2">
//                           <a
//                             href={`/viajes/${trip.id}`}
//                             className="text-blue-600 hover:underline"
//                           >
//                             Ver detalles
//                           </a>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <Pagination
//                 total={response.data.pagination.total}
//                 pageCount={response.data.pagination.pageCount}
//                 currentPage={page}
//                 pageSize={pageSize}
//                 urlBased={true}
//                 totalLabel="Viajes"
//               />
//             </>
//           ) : (
//             <div className="p-8 text-center bg-muted rounded-lg">
//               <p className="text-lg mb-4">No hay viajes disponibles con esos criterios de búsqueda.</p>
//               <p>Intenta modificar tu búsqueda o buscar en fechas diferentes.</p>
//             </div>
//           )}
//         </>
//       ) : !hasSearchParams ? (
//         <div className="text-center p-8 bg-muted rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">Busca tu próximo viaje</h2>
//           <p>Usa el formulario de búsqueda para encontrar viajes disponibles</p>
//         </div>
//       ) : (
//         <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
//           <p>Error al cargar los viajes: {response?.error?.message}</p>
//         </div>
//       )}
//     </div>
//   )
// }

import { searchTrips, TripSearchParams } from '@/actions/trip/search-trips'
// import { formatDatetoLocaleDateString } from '@/utils/format/formatDate'
import { Pagination } from '../admin/usuarios/components/Pagination'
import TripSearchForm from './components/trip-search-form'
import Header from '@/components/header/header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FaExclamationTriangle } from 'react-icons/fa'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
          { label: 'Home', href: '/' },
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
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {response.data.trips.length > 0
                  ? `Viajes de ${params.originCity} a ${params.destinationCity}`
                  : 'No se encontraron viajes'}
              </CardTitle>
              {response.data.trips.length > 0 && (
                <p className="text-muted-foreground">
                  Se encontraron {response.data.pagination.total} viajes
                </p>
              )}
            </CardHeader>
            <CardContent>
              {response.data.trips.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Asientos</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {response.data.trips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>{trip.originCity}</TableCell>
                          <TableCell>{trip.destinationCity}</TableCell>
                          <TableCell>{
                            format(new Date(trip.departureTime), 'HH:mm', { locale: es })
                          }</TableCell>
                          <TableCell>${trip.price}</TableCell>
                          <TableCell>{trip.availableSeats}</TableCell>
                          <TableCell>
                            <a
                              href={`/viajes/${trip.id}`}
                              className="text-primary hover:underline"
                            >
                              Ver detalles
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-6">
                    <Pagination
                      total={response.data.pagination.total}
                      pageCount={response.data.pagination.pageCount}
                      currentPage={page}
                      pageSize={pageSize}
                      urlBased={true}
                      totalLabel="Viajes"
                    />
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-lg mb-4">No hay viajes disponibles con esos criterios de búsqueda.</p>
                  <p className="text-muted-foreground">Intenta modificar tu búsqueda o buscar en fechas diferentes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
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