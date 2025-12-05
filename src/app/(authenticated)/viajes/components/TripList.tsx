'use client'

import { useRouter } from "next/navigation";

import { Calendar, Clock, Users, Info, UserCog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLoadingStore } from "@/store/loadingStore";
import { formatDatetoLocaleDateString } from "@/utils/format/formatDate";
import { getStatusBadgeColor, getStatusText } from "@/utils/helpers/trip/trip-helpers";

type TripsListProps = {
  trips: any[];
  emptyMessage: string;
  showRoleIndicator?: boolean;
};

export default function TripsList({ trips, emptyMessage, showRoleIndicator = false }: TripsListProps) {
  const router = useRouter();
  const { startLoading, isLoading, stopLoading } = useLoadingStore();

  const isNavigating = isLoading('navigatingToTrip');

  const handleTripClick = (tripId: string) => {
    if (isNavigating) return;

    startLoading('navigatingToTrip');

    setTimeout(() => {
      stopLoading('navigatingToTrip');
    }, 3000);

    router.push(`/viajes/${tripId}`);
  };

  // Helper to determine if this is a driver or passenger trip
  const isDriverTrip = (trip: any) => {
    return !trip.passengerData;
  };

  // Helper to check if trip has pending passengers
  const hasPendingPassengers = (trip: any) => {
    if (!isDriverTrip(trip)) return false;
    return trip.passengers && trip.passengers.some((p: any) => p.reservationStatus === 'PENDING_APPROVAL');
  };

  // Get pending passengers count
  const getPendingPassengersCount = (trip: any) => {
    if (!isDriverTrip(trip) || !trip.passengers) return 0;
    return trip.passengers.filter((p: any) => p.reservationStatus === 'PENDING_APPROVAL').length;
  };

  // Handle manage passengers button click
  const handleManagePassengers = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/viajes/${tripId}/pasajeros`);
  };

  // Get trip price display
  const getTripPriceDisplay = (trip: any) => {
    if (!trip) return "$0";

    if (trip.passengerData && trip.passengerData.seatsReserved) {
      return `$${(trip.price * trip.passengerData.seatsReserved).toFixed(2)}`;
    }

    // If it's a driver trip or no passenger data available
    return `$${trip.price.toFixed(2)}`;
  };

  // Get passengers/seats info display
  const getSeatsDisplay = (trip: any) => {
    if (!trip) return "0/0 pasajeros";

    if (isDriverTrip(trip)) {
      const confirmedPassengers = trip.passengers ?
        trip.passengers.filter((p: any) => ['CONFIRMED', 'APPROVED'].includes(p.reservationStatus)).length : 0;
      return `${confirmedPassengers}/${trip.availableSeats} pasajeros`;
    }

    if (trip.passengerData && trip.passengerData.seatsReserved) {
      return `${trip.passengerData.seatsReserved} asiento(s) reservado(s)`;
    }

    return "Información no disponible";
  };

  if (!trips || trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-lg">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <Card
          key={trip.id}
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
          onClick={() => handleTripClick(trip.id)}
        >


          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {trip.originCity} → {trip.destinationCity}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {formatDatetoLocaleDateString(trip.date)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasPendingPassengers(trip) && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-orange-500 text-white border-orange-300 rounded-full h-6 min-w-6 flex items-center justify-center shadow-md">
                          {getPendingPassengersCount(trip)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent
                        className="z-50 font-medium bg-slate-800 text-white px-3 py-2 shadow-lg border-0"
                        sideOffset={5}
                      >
                        {`${getPendingPassengersCount(trip)} solicitud(es) pendiente(s)`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Badge className={getStatusBadgeColor(trip.status)}>
                  {getStatusText(trip.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2 pb-4">
            <div className="space-y-2">
              {/* <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{trip.originProvince} → {trip.destinationProvince}</span>
              </div> */}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(trip.departureTime).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(trip.departureTime).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{getSeatsDisplay(trip)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t flex justify-between items-center">
            <div className="text-sm font-medium">
              {getTripPriceDisplay(trip)}
            </div>

            <div className="flex items-center gap-2">
              {showRoleIndicator && (
                <Badge variant="outline" className={isDriverTrip(trip)
                  ? "bg-blue-50 text-blue-700"
                  : "bg-purple-50 text-purple-700"
                }>
                  {isDriverTrip(trip) ? "Conductor" : "Pasajero"}
                </Badge>
              )}

              {/* Add manage passengers button for driver trips */}
              {isDriverTrip(trip) && ['PENDING', 'ACTIVE'].includes(trip.status) && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1 h-8 px-2"
                  onClick={(e) => handleManagePassengers(e, trip.id)}
                >
                  <UserCog className="h-4 w-4" />
                  <span className="hidden md:inline">Gestionar</span>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}