import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDuration } from '@/utils/format/formatDuration'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getGoogleMapsUrl } from '@/utils/helpers/getGoogleMapsUrl'
import { RouteResponse } from '@/types/route-types'
import { LocationInfo } from '@/types/route-types'

interface RouteInfoCardProps {
  routeInfo: RouteResponse
  origin: string
  destination: string
  tripDate?: Date
  departureTime?: string
  originInfo: LocationInfo
  destinationInfo: LocationInfo
}

const RouteInfoCard = ({
  routeInfo,
  origin,
  destination,
  tripDate,
  departureTime,
  originInfo,
  destinationInfo
}: RouteInfoCardProps) => {
  if (!routeInfo.routes || routeInfo.routes.length === 0) return null;
  
  const route = routeInfo.routes[0];
  const hasTolls = !!route.travelAdvisory?.tollInfo?.estimatedPrice;
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Información de la Ruta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Distancia</p>
            <p className="text-lg font-medium">
              {(route.distanceMeters / 1000).toFixed(1)} km
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duración</p>
            <p className="text-lg font-medium">
              {formatDuration(route.duration)}
            </p>
          </div>
        </div>

        {tripDate && departureTime && (
          <div>
            <p className="text-sm text-muted-foreground">Fecha y hora de salida</p>
            <p className="text-lg font-medium">
              {format(tripDate, 'PPP', { locale: es })} - {departureTime}
            </p>
          </div>
        )}

        {hasTolls && (
          <div>
            <p className="text-sm text-muted-foreground">Costo estimado de Peaje</p>
            <p className="text-lg font-medium">
              {route.travelAdvisory?.tollInfo?.estimatedPrice?.map((price, index) => (
                <span key={index}>
                  ${price.units}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Display city and province information */}
        <div className="border-t pt-3">
          <div className="mb-2">
            <span className="text-sm font-medium">Origen: </span>
            <span className="text-sm">{origin}</span>
            {originInfo.city && originInfo.province && (
              <p className="text-xs text-muted-foreground">
                {originInfo.city !== originInfo.province ? originInfo.city : ''}, {originInfo.province}
              </p>
            )}
          </div>
          <div>
            <span className="text-sm font-medium">Destino: </span>
            <span className="text-sm">{destination}</span>
            {destinationInfo.city && destinationInfo.province && (
              <p className="text-xs text-muted-foreground">
                {destinationInfo.city}, {destinationInfo.province}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link 
          href={getGoogleMapsUrl(origin, destination)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Ver ruta en Google Maps
        </Link>
      </CardFooter>
    </Card>
  )
}

export default RouteInfoCard