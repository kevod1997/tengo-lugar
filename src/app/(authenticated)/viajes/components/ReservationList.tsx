'use client'

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate, formatDatetoLocaleDateString, formatTime } from "@/utils/format/formatDate";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cancelReservation } from '@/actions/trip/cancel-reservation';
import { getStatusBadge } from '@/utils/helpers/reservation/reservation-helpers';
import { formatCurrency } from '@/utils/format/formateCurrency';

type ReservationsListProps = {
  activeReservations: any[];
  completedReservations: any[];
  cancelledReservations: any[];
};

export default function ReservationsList({
  activeReservations,
  completedReservations,
  cancelledReservations,
}: ReservationsListProps) {
  const router = useRouter();
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    
    setIsSubmitting(true);
    try {
      const result = await cancelReservation(selectedReservation);
      
      toast.success("Reserva cancelada", {
        description: result.message || "Tu reserva ha sido cancelada exitosamente."
      });
      
      router.refresh();
    } catch (error) {
      toast.error("Error al cancelar", {
        description: error instanceof Error ? error.message : "Hubo un error al cancelar tu reserva."
      });
    } finally {
      setIsSubmitting(false);
      setIsCancelDialogOpen(false);
      setSelectedReservation(null);
    }
  };
  
  const openCancelDialog = (reservationId: string) => {
    setSelectedReservation(reservationId);
    setIsCancelDialogOpen(true);
  };
  
  
  const renderReservationsList = (reservations: any[], showCancelButton: boolean = false) => {
    if (reservations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-10 bg-muted/30 rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tienes reservas en esta categoría</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reservations.map((reservation) => {
          const statusBadge = getStatusBadge(reservation.reservationStatus);
          const StatusIcon = statusBadge.icon;
          
          return (
            <Card 
              key={reservation.id} 
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {reservation.trip.originCity} → {reservation.trip.destinationCity}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {formatDatetoLocaleDateString(reservation.trip.date)}
                    </div>
                  </div>
                  <Badge className={statusBadge.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusBadge.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2 pb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{reservation.trip.originProvince} → {reservation.trip.destinationProvince}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(reservation.trip.departureTime)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(reservation.trip.departureTime)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{reservation.seatsReserved} asiento(s) reservado(s)</span>
                  </div>
                  
                  {/* <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Conductor: {reservation.trip.driverCar.driver.user.name.split(' ')[0]}</span>
                  </div> */}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 border-t flex justify-between items-center">
                <div className="text-sm font-medium">
                  {formatCurrency(reservation.totalPrice)}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/viajes/${reservation.trip.id}`)}
                  >
                    Ver detalles
                  </Button>
                  
                  {showCancelButton && ['PENDING_APPROVAL', 'APPROVED'].includes(reservation.reservationStatus) && (
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => openCancelDialog(reservation.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1 relative">
            Activas
            {activeReservations.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {activeReservations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completadas
            {completedReservations.length > 0 && (
              <Badge className="ml-2 bg-secondary text-secondary-foreground">
                {completedReservations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">
            Canceladas
            {cancelledReservations.length > 0 && (
              <Badge className="ml-2 bg-secondary text-secondary-foreground">
                {cancelledReservations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {renderReservationsList(activeReservations, true)}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {renderReservationsList(completedReservations)}
        </TabsContent>
        
        <TabsContent value="cancelled" className="mt-6">
          {renderReservationsList(cancelledReservations)}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Al cancelar tu reserva, perderás tu lugar en este viaje y tendrás que volver a reservar si cambias de opinión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // Prevent default to handle manually
                handleCancelReservation()
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Procesando..." : "Sí, cancelar reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}