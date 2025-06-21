// src/components/profile/user-profile-view.tsx
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format/formatDate";
import { 
  AlertCircle, 
  CarFront, 
  CheckCircle, 
  MapPin, 
  Star, 
  Calendar 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserProfileData } from "@/actions/user/get-user-profile-by-id";

interface UserProfileViewProps {
  profile: UserProfileData;
}

export function UserProfileView({ profile }: UserProfileViewProps) {
  const memberSinceDate = new Date(profile.memberSince);
  const memberSinceFormatted = new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long'
  }).format(memberSinceDate);

  return (
    <div className="max-w-4xl mx-auto page-content">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profileImage || undefined} alt={profile.firstName} />
              <AvatarFallback className="text-2xl">{profile.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {/* Badge de verificación con z-index más alto - similar al nav-user */}
            <div
              className="absolute -top-1 -right-1 rounded-full bg-white shadow-sm"
              style={{ zIndex: 100 }}
            >
              {profile.isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{profile.firstName}</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              Miembro desde {memberSinceFormatted}
            </div>
            
            {/* Badge de verificación textual */}
            <div className="flex items-center mt-1">
              {profile.isVerified ? (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600 bg-green-50 border-green-200">
                  <CheckCircle className="h-3 w-3" />
                  Usuario Verificado
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-3 w-3" />
                  Usuario No Verificado
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.isDriver && (
                <Badge variant="secondary">Conductor</Badge>
              )}
              {profile.isPassenger && (
                <Badge variant="secondary">Pasajero</Badge>
              )}
              {profile.age && (
                <Badge variant="outline">{profile.age} años</Badge>
              )}
              {profile.gender && (
                <Badge variant="outline">{profile.gender}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active trips section (if user is a driver with active trips) */}
      {profile.isDriver && profile.activeTrips.length > 0 && (
        <Card className="mb-6 border-dashed border-primary/30">
          <CardContent className="pt-4">
            <div className="flex items-center mb-3">
              <CarFront className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-medium">Próximos viajes disponibles</h3>
            </div>
            
            <div className="space-y-3">
              {profile.activeTrips.map(trip => (
                <div key={trip.id} className="flex items-center justify-between text-sm p-2 bg-primary/5 rounded-md">
                  <div className="flex flex-col">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{trip.from} → {trip.to}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{new Date(trip.date).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                  <Link href={`/viajes/${trip.id}`} passHref>
                    <Button variant="outline" size="sm">
                      {trip.availableSeats} {trip.availableSeats === 1 ? 'lugar' : 'lugares'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                {profile.isDriver && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Calificación como conductor</div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-1 fill-current" />
                      <span className="font-medium">{profile.driverRating?.toFixed(1) || 'Sin calificaciones'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.totalTripsAsDriver} {profile.totalTripsAsDriver === 1 ? 'viaje' : 'viajes'} como conductor
                    </div>
                  </div>
                )}

                {profile.isPassenger && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Calificación como pasajero</div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-1 fill-current" />
                      <span className="font-medium">{profile.passengerRating?.toFixed(1) || 'Sin calificaciones'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.totalTripsAsPassenger} {profile.totalTripsAsPassenger === 1 ? 'viaje' : 'viajes'} como pasajero
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {profile.reviews.length > 0 ? (
                profile.reviews.map(review => (
                  <div key={review.id} className="border-b last:border-0 pb-4 mb-4 last:pb-0 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.reviewerImage || undefined} alt={review.reviewerName} />
                        <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.reviewerName}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</div>
                      </div>
                      <div className="ml-auto flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                        <span>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm">{review.comment}</p>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Como {review.isDriver ? 'conductor' : 'pasajero'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay reseñas disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}