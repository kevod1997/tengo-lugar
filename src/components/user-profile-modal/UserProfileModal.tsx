// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { StarIcon, CarIcon, UserIcon, ExternalLinkIcon } from "lucide-react"
// import Link from "next/link"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// // Type definitions for the component props
// interface UserProfileProps {
//   // Basic user info
//   userId: string
//   name: string
//   profileImage?: string
//   age?: number
//   gender?: 'MASCULINO' | 'FEMENINO' | 'NO_BINARIO'
  
//   // Statistics
//   tripStats?: {
//     asDriver?: {
//       tripsCompleted: number
//       rating: number
//       reviewCount: number
//     }
//     asPassenger?: {
//       tripsCompleted: number
//       rating: number
//       reviewCount: number
//     }
//   }

//   // Display options
//   showFullProfileLink?: boolean
//   children?: React.ReactNode // The trigger element (avatar, name, etc.)
// }

// export function UserProfileModal({
//   userId,
//   name,
//   profileImage,
//   age,
//   gender,
//   tripStats,
//   showFullProfileLink = true,
//   children
// }: UserProfileProps) {
//   // Get the first name for the avatar fallback
//   console.log({
//     userId,
//     name,
//     profileImage,
//     age,
//     tripStats,
//   })
//   const firstName = name.split(' ')[0]
//   const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  
//   // Format the gender display
//   const genderMap = {
//     'MASCULINO': 'Hombre',
//     'FEMENINO': 'Mujer',
//     'NO_BINARIO': 'No binario'
//   }

//   // Handle which mode to show based on available stats
//   const hasDriverStats = tripStats?.asDriver && tripStats.asDriver.tripsCompleted > 0
//   const hasPassengerStats = tripStats?.asPassenger && tripStats.asPassenger.tripsCompleted > 0
//   const defaultTab = hasDriverStats ? 'driver' : 'passenger'

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         {children || (
//           <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
//             <Avatar className="h-8 w-8">
//               <AvatarImage src={profileImage} alt={name} />
//               <AvatarFallback>{initials}</AvatarFallback>
//             </Avatar>
//             <span className="text-sm font-medium">{firstName}</span>
//           </div>
//         )}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Perfil de Usuario</DialogTitle>
//         </DialogHeader>

//         {/* User basic info */}
//         <div className="flex flex-col items-center my-4">
//           <Avatar className="h-20 w-20 mb-3">
//             <AvatarImage src={profileImage} alt={name} />
//             <AvatarFallback className="text-lg">{initials}</AvatarFallback>
//           </Avatar>
//           <h3 className="text-xl font-semibold">{name}</h3>
//           <div className="flex items-center gap-2 mt-1 text-muted-foreground">
//             {age && <span>{age} años</span>}
//             {age && gender && <span>•</span>}
//             {gender && <span>{genderMap[gender] || gender}</span>}
//           </div>
//         </div>

//         {/* Stats tabs */}
//         <Tabs defaultValue={defaultTab} className="w-full">
//           <TabsList className="grid grid-cols-2 w-full">
//             <TabsTrigger value="driver" disabled={!hasDriverStats}>
//               <CarIcon className="h-4 w-4 mr-2" />
//               Como Conductor
//             </TabsTrigger>
//             <TabsTrigger value="passenger" disabled={!hasPassengerStats}>
//               <UserIcon className="h-4 w-4 mr-2" />
//               Como Pasajero
//             </TabsTrigger>
//           </TabsList>
          
//           {/* Driver stats */}
//           <TabsContent value="driver" className="space-y-4 py-4">
//             {hasDriverStats ? (
//               <div className="bg-slate-50 rounded-lg p-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-slate-500">Viajes completados</p>
//                     <p className="font-medium">{tripStats?.asDriver?.tripsCompleted}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-500">Valoración</p>
//                     <div className="flex items-center gap-1">
//                       <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//                       <span className="font-medium">
//                         {tripStats?.asDriver?.rating.toFixed(1)}
//                       </span>
//                       <span className="text-xs text-slate-500">
//                         ({tripStats?.asDriver?.reviewCount} reseñas)
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-6 text-muted-foreground">
//                 No hay datos disponibles como conductor
//               </div>
//             )}
//           </TabsContent>
          
//           {/* Passenger stats */}
//           <TabsContent value="passenger" className="space-y-4 py-4">
//             {hasPassengerStats ? (
//               <div className="bg-slate-50 rounded-lg p-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-slate-500">Viajes realizados</p>
//                     <p className="font-medium">{tripStats?.asPassenger?.tripsCompleted}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-500">Valoración</p>
//                     <div className="flex items-center gap-1">
//                       <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//                       <span className="font-medium">
//                         {tripStats?.asPassenger?.rating.toFixed(1)}
//                       </span>
//                       <span className="text-xs text-slate-500">
//                         ({tripStats?.asPassenger?.reviewCount} reseñas)
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-6 text-muted-foreground">
//                 No hay datos disponibles como pasajero
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
        
//         {/* Link to full profile */}
//         {showFullProfileLink && (
//           <div className="mt-4">
//             <Button
//               variant="outline"
//               className="w-full"
//               asChild
//             >
//               <Link href={`/perfil/${userId}`}>
//                 Ver perfil completo
//                 <ExternalLinkIcon className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   )
// }

import Link from "next/link"

import { StarIcon, CarIcon, UserIcon, ExternalLinkIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Type definitions for the component props
interface UserProfileProps {
  // Basic user info
  userId: string
  name: string
  profileImage?: string
  age?: number
  gender?: 'MASCULINO' | 'FEMENINO' | 'NO_BINARIO'
  
  // Statistics - Simplificado para mostrar un conjunto específico
  tripStats?: {
    asDriver?: {
      tripsCompleted: number
      rating: number
      reviewCount: number
    }
    asPassenger?: {
      tripsCompleted: number
      rating: number
      reviewCount: number
    }
  }

  // Rol principal para determinar qué estadísticas mostrar
  primaryRole: 'driver' | 'passenger'

  // Display options
  showFullProfileLink?: boolean
  children?: React.ReactNode // The trigger element (avatar, name, etc.)
}

export function UserProfileModal({
  userId,
  name,
  profileImage,
  age,
  gender,
  tripStats,
  primaryRole,
  showFullProfileLink = true,
  children
}: UserProfileProps) {
  // Get the first name and initials for the avatar fallback
  const firstName = name.split(' ')[0]
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  
  // Format the gender display
  const genderMap = {
    'MASCULINO': 'Hombre',
    'FEMENINO': 'Mujer',
    'NO_BINARIO': 'No binario'
  }

  // Determine stats to show based on primaryRole
  const roleStats = primaryRole === 'driver' 
    ? tripStats?.asDriver 
    : tripStats?.asPassenger;
  
  // Determine if stats are all zeros
  const hasActiveStats = roleStats && (
    roleStats.tripsCompleted > 0 || 
    roleStats.rating > 0 || 
    roleStats.reviewCount > 0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImage} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{firstName}</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil de {primaryRole === 'driver' ? 'Conductor' : 'Pasajero'}</DialogTitle>
        </DialogHeader>

        {/* User basic info */}
        <div className="flex flex-col items-center my-4">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage src={profileImage} alt={name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{name}</h3>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            {age && <span>{age} años</span>}
            {age && gender && <span>•</span>}
            {gender && <span>{genderMap[gender] || gender}</span>}
          </div>
        </div>

        {/* Stats simplified */}
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              {primaryRole === 'driver' ? (
                <CarIcon className="h-5 w-5 mr-2 text-primary" />
              ) : (
                <UserIcon className="h-5 w-5 mr-2 text-primary" />
              )}
              <h4 className="font-medium">
                {primaryRole === 'driver' ? 'Experiencia como conductor' : 'Experiencia como pasajero'}
              </h4>
            </div>
            
            {hasActiveStats ? (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm text-slate-500">Viajes completados</p>
                  <p className="font-medium">{roleStats?.tripsCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Valoración</p>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {roleStats?.rating ? roleStats.rating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({roleStats?.reviewCount || 0} reseñas)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-2">
                {primaryRole === 'driver' 
                  ? 'Este conductor aún no ha completado viajes o no tiene reseñas.' 
                  : 'Este pasajero aún no ha realizado viajes o no tiene reseñas.'}
              </p>
            )}
          </div>
        </div>
        
        {/* Link to full profile */}
        {showFullProfileLink && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href={`/perfil/${userId}`}>
                Ver perfil completo
                <ExternalLinkIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}