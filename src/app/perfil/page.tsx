// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import Header from '@/components/header/header'
// import { useUserStore } from '@/store/user-store'
// import { toast } from 'sonner'
// import { useForm } from 'react-hook-form'
// import { useApiResponse } from '@/hooks/ui/useApiResponse'
// import { handleProfileImageUpload } from '@/utils/helpers/profile/profile-image-handler'
// import { useRouter } from 'next/navigation'

// // shadcn components
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { CalendarIcon, CameraIcon, AlertTriangleIcon, Loader2Icon, TrashIcon } from "lucide-react"
// import { CountryCode } from 'libphonenumber-js'
// import { PhoneVerification } from '@/components/phone-verification/PhoneVerification'
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { VerificationStatus } from '@prisma/client'

// const UserProfilePage = () => {
//   const { user, setUser } = useUserStore()
//   const [isLoading, setIsLoading] = useState(false)
//   const [isUploadingImage, setIsUploadingImage] = useState(false)
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
//   const [isDeletingAccount, setIsDeletingAccount] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const { handleResponse } = useApiResponse()
//   const router = useRouter()

//   const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
//     defaultValues: {
//       firstName: '',
//       lastName: '',
//       email: '',
//       phoneNumber: '',
//       phoneNumberVerified: false,
//       gender: '',
//       birthDate: '',
//     }
//   });

//   // Check if identity is verified
//   const isIdentityVerified = user?.identityStatus === VerificationStatus.VERIFIED

//   // Update form when user data changes
//   useEffect(() => {
//     if (user) {
//       reset({
//         firstName: user.firstName || '',
//         lastName: user.lastName || '',
//         email: user.email || '',
//         phoneNumber: user.phoneNumber || '',
//         phoneNumberVerified: user.phoneNumberVerified || false,
//         gender: user.gender || '',
//         birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
//       });
//     }
//   }, [user, reset]);

//   const phoneNumberValue = watch('phoneNumber')
//   const phoneNumberVerified = watch('phoneNumberVerified')
//   const [selectedCountry, setSelectedCountry] = useState<CountryCode>('AR')

//   // Esta función permite que el componente PhoneNumberVerification actualice el estado del formulario
//   const handlePhoneNumberVerified = (phoneNumber: string, isVerified: boolean) => {
//     setValue('phoneNumber', phoneNumber, { shouldValidate: true })
//     setValue('phoneNumberVerified', isVerified, { shouldValidate: true })
//   }

//   const onSubmit = async (data: any) => {
//     if (!user) return

//     // Your submission logic here
//     console.log("Form data to submit:", data);
//   }

//   const handleImageClick = () => {
//     fileInputRef.current?.click()
//   }

//   const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (!user) return

//     if (user.birthDate === null) {
//       toast.error("Error", {
//         description: "Debes completar tu registro primero"
//       })
//       return
//     }

//     await handleProfileImageUpload({
//       event,
//       user,
//       setIsUploadingImage,
//       setUser,
//       handleResponse
//     })
//   }

//   const handleCompleteRegistration = () => {
//     router.push('/dashboard')
//   }

//   const handleDeleteAccount = async () => {
//     setIsDeletingAccount(true)
//     try {
//       // Here you would implement the actual account deletion logic
//       // For now we'll just simulate it with a timeout
//       await new Promise(resolve => setTimeout(resolve, 1500))

//       toast.success("Cuenta eliminada", {
//         description: "Tu cuenta ha sido eliminada correctamente"
//       })

//       // Redirect to home or login page
//       router.push('/')
//     } catch (error) {
//       toast.error("Error", {
//         description: "No se pudo eliminar la cuenta. Intente nuevamente."
//       })
//     } finally {
//       setIsDeletingAccount(false)
//       setIsDeleteDialogOpen(false)
//     }
//   }

//   if (!user) {
//     return (
//       <div className="flex flex-col w-full">
//         <Header
//           breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Perfil' }]}
//           showBackButton={false}
//         />
//         <div className="mt-6 w-full flex justify-center">
//           <Card className="w-full max-w-md">
//             <CardHeader>
//               <CardTitle>Información no disponible</CardTitle>
//               <CardDescription>No se encontró información del usuario</CardDescription>
//             </CardHeader>
//           </Card>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col w-full">
//       <Header
//         breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Perfil' }]}
//         showBackButton={false}
//       />
//       {user.birthDate === null ? (
//         <div className="container mx-auto p-4 max-w-3xl">
//           <Alert className="my-6 bg-card border" >
//             <AlertTriangleIcon className="h-4 w-4" />
//             <AlertTitle>Registro incompleto</AlertTitle>
//             <AlertDescription>
//               <p className="mb-4">Necesitas completar tu información personal para poder usar todas las funcionalidades.</p>
//               <Button variant="default" onClick={handleCompleteRegistration}>
//                 Completar registro
//               </Button>
//             </AlertDescription>
//           </Alert>

//           <Card className="mt-6">
//             <CardContent className="pt-6 text-center text-muted-foreground">
//               <p>No podrás acceder a todas las funciones hasta que completes tu registro.</p>
//             </CardContent>
//           </Card>
//         </div>
//       ) : (
//         <div className="container mx-auto p-4 max-w-3xl">
//           <Card className="mb-8">
//             <CardHeader className="flex items-center pb-2">
//               <div className="relative" onClick={handleImageClick}>
//                 <Avatar className="h-24 w-24 cursor-pointer relative">
//                   <AvatarImage
//                     src={user.profileImageKey || ''}
//                     alt={`${user.firstName} ${user.lastName}`}
//                     className={isUploadingImage ? 'opacity-50' : ''}
//                   />
//                   <AvatarFallback className="text-2xl">
//                     {user.firstName?.[0]}{user.lastName?.[0]}
//                   </AvatarFallback>
//                   {isUploadingImage && (
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
//                     </div>
//                   )}
//                 </Avatar>
//                 <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1">
//                   <CameraIcon className="h-4 w-4" />
//                 </div>
//               </div>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="hidden cursor-pointer"
//                 accept="image/jpeg,image/png"
//                 onChange={handleImageChange}
//                 disabled={isUploadingImage}
//               />
//             </CardHeader>
//             <CardContent>
//               {isIdentityVerified && (
//                 <Alert className="mb-6 bg-muted">
//                   <AlertTriangleIcon className="h-4 w-4" />
//                   <AlertTitle>Identidad verificada</AlertTitle>
//                   <AlertDescription>
//                     No puedes modificar tu nombre, apellido y fecha de nacimiento ya que tu identidad ha sido verificada.
//                   </AlertDescription>
//                 </Alert>
//               )}

//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName">Nombre</Label>
//                     <Input
//                       id="firstName"
//                       {...register('firstName', { required: 'El nombre es requerido' })}
//                       disabled={isIdentityVerified}
//                       className={isIdentityVerified ? 'bg-muted' : ''}
//                     />
//                     {errors.firstName && (
//                       <p className="text-destructive text-xs">{errors.firstName.message}</p>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">Apellido</Label>
//                     <Input
//                       id="lastName"
//                       {...register('lastName', { required: 'El apellido es requerido' })}
//                       disabled={isIdentityVerified}
//                       className={isIdentityVerified ? 'bg-muted' : ''}
//                     />
//                     {errors.lastName && (
//                       <p className="text-destructive text-xs">{errors.lastName.message}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     {...register('email', {
//                       required: 'El email es requerido',
//                       pattern: {
//                         value: /^\S+@\S+\.\S+$/,
//                         message: 'Ingrese un email válido'
//                       }
//                     })}
//                     disabled
//                   />
//                   {errors.email && (
//                     <p className="text-destructive text-xs">{errors.email.message}</p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <PhoneVerification
//                     initialPhone={phoneNumberValue}
//                     initialVerified={phoneNumberVerified}
//                     onVerificationChange={handlePhoneNumberVerified}
//                     selectedCountry={selectedCountry}
//                     setSelectedCountry={setSelectedCountry}
//                     // Podemos pasar un prop para ajustar el comportamiento según el contexto
//                     required={true}
//                   />
//                   {errors.phoneNumber && (
//                     <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message as string}</p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="gender">Género</Label>
//                     <Select
//                       defaultValue={user.gender}
//                       onValueChange={(value) => {
//                         register('gender').onChange({
//                           target: { name: 'gender', value }
//                         });
//                       }}
//                     >
//                       <SelectTrigger id="gender">
//                         <SelectValue placeholder="Seleccione una opción" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="MASCULINO">Masculino</SelectItem>
//                         <SelectItem value="FEMENINO">Femenino</SelectItem>
//                         <SelectItem value="NO_BINARIO">No binario</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="birthDate">Fecha de nacimiento</Label>
//                     <div className="relative">
//                       <Input
//                         id="birthDate"
//                         type="date"
//                         {...register('birthDate')}
//                         disabled={isIdentityVerified}
//                         className={isIdentityVerified ? 'bg-muted' : ''}
//                       />
//                       <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex justify-end space-x-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => toast.info('Operación cancelada')}
//                     disabled={isLoading}
//                   >
//                     Cancelar
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <>
//                         <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
//                         Guardando...
//                       </>
//                     ) : (
//                       'Guardar cambios'
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Card className="mt-6">
//               <CardHeader>
//                 <CardTitle>Cambiar contraseña</CardTitle>
//                 <CardDescription>
//                   Si deseas cambiar tu contraseña, puedes hacerlo desde aquí.
//                 </CardDescription>
//               </CardHeader>
//               <CardFooter>
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     // Redirect to password reset page or open modal
//                     toast.info('Funcionalidad en desarrollo')
//                   }}
//                 >
//                   Cambiar contraseña
//                 </Button>
//               </CardFooter>
//             </Card>

//             <Card className="mt-6 border-destructive/20">
//               <CardHeader>
//                 <CardTitle className="text-destructive">Eliminar cuenta</CardTitle>
//                 <CardDescription>
//                   Esta acción no puede deshacerse. Se perderán todos tus datos.
//                 </CardDescription>
//               </CardHeader>
//               <CardFooter>
//                 <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button variant="destructive" className="w-full">
//                       <TrashIcon className="h-4 w-4 mr-2" />
//                       Eliminar mi cuenta
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>¿Estás seguro de que deseas eliminar tu cuenta?</DialogTitle>
//                       <DialogDescription>
//                         Esta acción no puede deshacerse. Se eliminarán permanentemente todos tus datos, incluyendo información personal, viajes, valoraciones y otros datos asociados a tu cuenta.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
//                       <Button
//                         variant="outline"
//                         onClick={() => setIsDeleteDialogOpen(false)}
//                         className="sm:mr-auto"
//                       >
//                         Cancelar
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         onClick={handleDeleteAccount}
//                         disabled={isDeletingAccount}
//                       >
//                         {isDeletingAccount ? (
//                           <>
//                             <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
//                             Eliminando...
//                           </>
//                         ) : (
//                           <>
//                             <TrashIcon className="mr-2 h-4 w-4" />
//                             Confirmar eliminación
//                           </>
//                         )}
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//               </CardFooter>
//             </Card>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UserProfilePage


import { Suspense } from 'react'
import Header from '@/components/header/header'
import { LoadingOverlay } from '@/components/loader/loading-overlay'
import ProfileContent from './componenetes/ProfileContent'

export default function UserProfilePage() {
  return (
    <div className="flex flex-col w-full">
      <Header
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Perfil' }]}
        showBackButton={false}
      />
      <Suspense fallback={<LoadingOverlay isLoading={true} />}>
        <ProfileContent />
      </Suspense>
    </div>
  )
}