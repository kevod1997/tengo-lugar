// 'use client'

// import { useState, useEffect, Dispatch, SetStateAction } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// import { BadgeCheck, Clock, AlertCircle, Send, Loader2 } from 'lucide-react'
// import { toast } from 'sonner'
// import { Badge } from '@/components/ui/badge'
// import { initiatePhoneVerification, verifyPhoneWithOTP } from '@/actions/profile/verify-phone'
// import { AsYouType, CountryCode } from 'libphonenumber-js';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
// import { formatNumberForWhatsApp } from '@/utils/format/format-whatsapp-phone'

// const COUNTRY_CODES = [
//   { code: 'AR', name: 'Argentina (+54)', callingCode: '54' },
//   { code: 'US', name: 'USA/Canada (+1)', callingCode: '1' },
//   { code: 'ES', name: 'España (+34)', callingCode: '34' },
//   { code: 'MX', name: 'México (+52)', callingCode: '52' },
//   { code: 'BR', name: 'Brasil (+55)', callingCode: '55' },
//   { code: 'CL', name: 'Chile (+56)', callingCode: '56' },
//   { code: 'CO', name: 'Colombia (+57)', callingCode: '57' },
//   { code: 'VE', name: 'Venezuela (+58)', callingCode: '58' },
//   { code: 'PE', name: 'Perú (+51)', callingCode: '51' },
//   // Add more as needed
// ]

// interface PhoneVerificationProps {
//   initialPhone?: string;
//   initialVerified?: boolean;
//   onVerificationChange: (phone: string, isVerified: boolean) => void;
//   selectedCountry?: CountryCode;
//   setSelectedCountry?: Dispatch<SetStateAction<CountryCode>>;
//   required?: boolean;
//   label?: string;
//   hideLabel?: boolean;
// }

// export function PhoneVerification({
//   initialPhone = '',
//   initialVerified = false,
//   onVerificationChange,
//   selectedCountry,
//   setSelectedCountry,
//   required = false,
//   label = 'Teléfono',
//   hideLabel = false
// }: PhoneVerificationProps) {
//   const [phoneNumber, setPhoneNumber] = useState(initialPhone)
//   const [otpId, setOtpId] = useState<string | null>(null)
//   const [otpCode, setOtpCode] = useState('')
//   const [expiresAt, setExpiresAt] = useState<Date | null>(null)
//   const [countdown, setCountdown] = useState(0)
//   const [isVerified, setIsVerified] = useState(initialVerified)
//   const [isSending, setIsSending] = useState(false)
//   const [isVerifying, setIsVerifying] = useState(false)

//   // Si el número cambia externamente, actualizar el estado
//   useEffect(() => {
//     setPhoneNumber(initialPhone)
//   }, [initialPhone])

//   // Si el estado de verificación cambia externamente, actualizar el estado
//   useEffect(() => {
//     setIsVerified(initialVerified)
//   }, [initialVerified])

//   // Gestionar cuenta regresiva para el código OTP
//   useEffect(() => {
//     if (!expiresAt) return

//     const updateCountdown = () => {
//       const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
//       if (remaining <= 0) {
//         setCountdown(0)
//         setOtpId(null)
//         return
//       }
//       setCountdown(remaining)
//     }

//     updateCountdown()
//     const interval = setInterval(updateCountdown, 1000)
//     return () => clearInterval(interval)
//   }, [expiresAt])

//   // Formatea el tiempo restante en formato mm:ss
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins}:${secs.toString().padStart(2, '0')}`
//   }

//   // Actualiza el estado del teléfono y notifica al padre
//   const updatePhone = (phone: string) => {
//     setPhoneNumber(phone)
//     onVerificationChange(phone, isVerified)
//   }

//   // Actualiza el estado de verificación y notifica al padre
//   const updateVerified = (phone: string, verified: boolean) => {
//     setIsVerified(verified)
//     onVerificationChange(phone, verified)
//   }

//   const handleSendOTP = async (formattedNumber?: string) => {
//     if (!formattedNumber && !phoneNumber) {
//       toast.error('Ingrese un número de teléfono válido');
//       return;
//     }

//     setIsSending(true);
//     try {
//       // Usar el número ya formateado que se pasó como parámetro
//       const numberToUse = formattedNumber || phoneNumber;

//       // Esta llamada sería a tu server action
//       const result = await initiatePhoneVerification(numberToUse);

//       if (result.success) {
//         if (result.data) {
//           setOtpId(result.data.otpId);
//           setExpiresAt(new Date(result.data.expiresAt));
//         } else {
//           toast.error('Error al enviar el código');
//         }
//         toast.success('Código enviado correctamente a tu WhatsApp');
//       } else {
//         toast.error(result.error?.message || 'Error al enviar el código');
//       }
//     } catch (error) {
//       console.error('Error al iniciar verificación:', error);
//       toast.error('Error al enviar el código de verificación');
//     } finally {
//       setIsSending(false);
//     }
//   }

//   // Verifica el código OTP ingresado
//   const handleVerifyOTP = async () => {
//     if (!otpId || !otpCode) {
//       toast.error('Ingrese el código de verificación')
//       return
//     }

//     setIsVerifying(true)
//     try {
//       // Esta llamada sería a tu server action
//       const result = await verifyPhoneWithOTP(otpId, otpCode)

//       if (result.success) {
//         if (result.data && result.data.verified) {
//           updateVerified(phoneNumber, true)
//           toast.success('Número verificado correctamente')
//         } else {
//           toast.error('Código incorrecto, intente nuevamente')
//         }
//       } else {
//         toast.error(result.error?.message || 'Error al verificar el código')
//       }
//     } catch (error) {
//       console.error('Error al verificar código:', error)
//       toast.error('Error al verificar el código')
//     } finally {
//       setIsVerifying(false)
//     }
//   }

//   // Si el número ya está verificado, muestra el mensaje de éxito
//   if (isVerified) {
//     return (
//       <div className="space-y-2">
//         {!hideLabel && (
//           <div className="flex items-center">
//             <Label htmlFor="phone" className="flex-grow">{label}</Label>
//             <Badge className="ml-2 bg-green-500 hover:bg-green-600" variant="secondary">
//               <BadgeCheck className="h-3 w-3 mr-1" />
//               Verificado
//             </Badge>
//           </div>
//         )}
//         <div className="flex">
//           <Input
//             id="phone"
//             value={phoneNumber}
//             onChange={(e) => updatePhone(e.target.value)}
//             disabled={true}
//             className="flex-grow"
//           />
//         </div>
//       </div>
//     )
//   }


//   return (
//     <div className="space-y-4">
//       <div className="space-y-2">
//         {!hideLabel && (
//           <div className="flex items-center">
//             <Label htmlFor="phone" className="flex-grow">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
//             {!otpId && (
//               <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500">
//                 <AlertCircle className="h-3 w-3 mr-1" />
//                 No verificado
//               </Badge>
//             )}
//           </div>
//         )}

//         <div className="space-y-1">
//           <div className="flex space-x-2">
//             <Select
//               value={selectedCountry}
//               // onValueChange={(value) => {
//               //   setSelectedCountry && setSelectedCountry(value as CountryCode);
//               //   // Limpiar el número actual al cambiar de país
//               //   updatePhone('');
//               // }}
//               onValueChange={(value) => {
//                 setSelectedCountry?.(value as CountryCode);
//                 // Limpiar el número actual al cambiar de país
//                 updatePhone('');
//               }}
//               disabled={!!otpId || isSending}
//             >
//               <SelectTrigger className="w-[140px]">
//                 <SelectValue placeholder="País" />
//               </SelectTrigger>
//               <SelectContent>
//                 {COUNTRY_CODES.map(country => (
//                   <SelectItem key={country.code} value={country.code}>
//                     {country.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Input
//               id="phone"
//               placeholder="Número sin 0 ni 15"
//               value={phoneNumber}
//               onChange={(e) => {
//                 // Usar AsYouType para formatear el número mientras el usuario escribe
//                 const formatter = new AsYouType(selectedCountry as CountryCode);
//                 const formattedInput = formatter.input(e.target.value);
//                 updatePhone(formattedInput);
//               }}
//               disabled={!!otpId || isSending}
//               className="flex-grow"
//             />

//             <Button
//               onClick={() => {
//                 const formattedNumber = formatNumberForWhatsApp(phoneNumber, selectedCountry);

//                 if (!formattedNumber) {
//                   toast.error('Por favor ingresa un número válido');
//                   return;
//                 }

//                 handleSendOTP(formattedNumber);

//               }}
//               type='button'
//               disabled={isSending || !!otpId || !phoneNumber}
//               size="sm"
//               variant="outline"
//             >
//               {isSending ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Enviando
//                 </>
//               ) : (
//                 <>
//                   <Send className="h-4 w-4 mr-2" />
//                   Verificar
//                 </>
//               )}
//             </Button>
//           </div>

//           <p className="text-xs text-muted-foreground">
//             Ingresa tu número sin códigos locales (sin 0 ni 15 para Argentina)
//           </p>
//         </div>
//       </div>

//       {otpId && (
//         <div className="space-y-4">
//           <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
//             <Clock className="h-4 w-4" />
//             <AlertTitle>Código enviado</AlertTitle>
//             <AlertDescription>
//               Hemos enviado un código a tu WhatsApp. El código expira en <span className="font-medium">{formatTime(countdown)}</span>
//             </AlertDescription>
//           </Alert>

//           <div className="space-y-2">
//             <Label htmlFor="otp">Código de verificación</Label>
//             <div className="flex space-x-2">
//               <Input
//                 id="otp"
//                 placeholder="123456"
//                 value={otpCode}
//                 onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
//                 maxLength={6}
//                 className="flex-grow"
//               />
//               <Button
//                 onClick={handleVerifyOTP}
//                 disabled={isVerifying || otpCode.length < 6}
//                 size="sm"
//                 variant="default"
//               >
//                 {isVerifying ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Verificando
//                   </>
//                 ) : (
//                   "Verificar"
//                 )}
//               </Button>
//             </div>
//             <p className="text-xs text-muted-foreground mt-1">
//               No compartiremos tu número de teléfono con terceros.
//             </p>
//           </div>

//           <div className="flex justify-between items-center">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setOtpId(null);
//                 setOtpCode('');
//                 setExpiresAt(null);
//               }}
//             >
//               Cancelar
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 const formattedNumber = formatNumberForWhatsApp(phoneNumber, selectedCountry);

//                 if (!formattedNumber) {
//                   toast.error('Por favor ingresa un número válido');
//                   return;
//                 }

//                 handleSendOTP(formattedNumber);

//               }}
//               disabled={isSending}
//             >
//               {isSending ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Reenviando...
//                 </>
//               ) : (
//                 "Reenviar código"
//               )}
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BadgeCheck, Clock, AlertCircle, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { initiatePhoneVerification, verifyPhoneWithOTP } from '@/actions/profile/verify-phone' // Assuming action paths are correct
import { AsYouType, CountryCode } from 'libphonenumber-js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select' // Assuming path to ui/select is correct
import { formatNumberForWhatsApp } from '@/utils/format/format-whatsapp-phone' // Assuming path is correct

const COUNTRY_CODES = [
  { code: 'AR', name: 'Argentina (+54)', callingCode: '54' },
  { code: 'US', name: 'USA/Canada (+1)', callingCode: '1' },
  { code: 'ES', name: 'España (+34)', callingCode: '34' },
  { code: 'MX', name: 'México (+52)', callingCode: '52' },
  { code: 'BR', name: 'Brasil (+55)', callingCode: '55' },
  { code: 'CL', name: 'Chile (+56)', callingCode: '56' },
  { code: 'CO', name: 'Colombia (+57)', callingCode: '57' },
  { code: 'VE', name: 'Venezuela (+58)', callingCode: '58' },
  { code: 'PE', name: 'Perú (+51)', callingCode: '51' },
  // Add more as needed
]

interface PhoneVerificationProps {
  initialPhone?: string;
  initialVerified?: boolean;
  onVerificationChange: (phone: string, isVerified: boolean) => void;
  selectedCountry?: CountryCode;
  setSelectedCountry?: Dispatch<SetStateAction<CountryCode>>;
  required?: boolean;
  label?: string;
  hideLabel?: boolean;
}

export function PhoneVerification({
  initialPhone = '',
  initialVerified = false,
  onVerificationChange,
  selectedCountry = 'AR', // Provide a default if ProfileForm doesn't always provide it
  setSelectedCountry,
  required = false,
  label = 'Teléfono',
  hideLabel = false
}: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone)
  const [otpId, setOtpId] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [isVerified, setIsVerified] = useState(initialVerified)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    setPhoneNumber(initialPhone)
  }, [initialPhone])

  useEffect(() => {
    setIsVerified(initialVerified)
  }, [initialVerified])

  useEffect(() => {
    if (!expiresAt) return

    const updateCountdown = () => {
      const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      if (remaining <= 0) {
        setCountdown(0)
        setOtpId(null) // Consider if OTP ID should be cleared or just state that it's expired
        return
      }
      setCountdown(remaining)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const updatePhone = (phone: string) => {
    setPhoneNumber(phone)
    onVerificationChange(phone, isVerified) // Pass current isVerified state
  }

  const updateVerified = (phone: string, verified: boolean) => {
    setIsVerified(verified)
    onVerificationChange(phone, verified)
  }

  const handleSendOTP = async (numberToUseForVerification?: string) => {
    const effectiveNumber = numberToUseForVerification || phoneNumber;
    if (!effectiveNumber) {
      toast.error('Ingrese un número de teléfono válido');
      return;
    }

    setIsSending(true);
    try {
      const result = await initiatePhoneVerification(effectiveNumber);

      if (result.success && result.data) {
        setOtpId(result.data.otpId);
        setExpiresAt(new Date(result.data.expiresAt));
        toast.success('Código enviado correctamente a tu WhatsApp');
      } else {
        toast.error(result.error?.message || 'Error al enviar el código');
      }
    } catch (error) {
      console.error('Error al iniciar verificación:', error);
      toast.error('Error al enviar el código de verificación');
    } finally {
      setIsSending(false);
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpId || !otpCode) {
      toast.error('Ingrese el código de verificación')
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyPhoneWithOTP(otpId, otpCode)

      if (result.success && result.data?.verified) {
        updateVerified(phoneNumber, true) // Use current phoneNumber from state
        toast.success('Número verificado correctamente')
      } else {
        toast.error(result.error?.message || 'Código incorrecto o error al verificar')
      }
    } catch (error) {
      console.error('Error al verificar código:', error)
      toast.error('Error al verificar el código')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <div className="space-y-2">
        {!hideLabel && (
          <div className="flex items-center">
            <Label htmlFor="phone" className="flex-grow">{label}</Label>
            <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-white" variant="default">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          </div>
        )}
        <div className="flex">
          <Input
            id="phone"
            value={phoneNumber}
            readOnly // Keep it readOnly as it's verified
            disabled={true}
            className="flex-grow bg-muted"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {!hideLabel && (
          <div className="flex items-center">
            <Label htmlFor="phone-input" className="flex-grow">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
            {!otpId && (
              <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-500">
                <AlertCircle className="h-3 w-3 mr-1" />
                No verificado
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-1">
          {/* Container for inputs: flex-col on mobile, flex-row on sm and up */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Select
              value={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry?.(value as CountryCode);
                updatePhone(''); // Clear phone number on country change
              }}
              disabled={!!otpId || isSending}
            >
              {/* Full width on mobile, specific width on sm+ */}
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              id="phone-input" // Changed id to avoid conflict if Label's htmlFor is "phone"
              placeholder="Número sin 0 ni 15"
              value={phoneNumber}
              onChange={(e) => {
                const formatter = new AsYouType(selectedCountry as CountryCode);
                const formattedInput = formatter.input(e.target.value);
                updatePhone(formattedInput);
              }}
              disabled={!!otpId || isSending}
              className="w-full sm:flex-grow" // Full width on mobile, flex-grow on sm+
            />

            <Button
              onClick={() => {
                const formattedNumber = formatNumberForWhatsApp(phoneNumber, selectedCountry);
                if (!formattedNumber) {
                  toast.error('Por favor ingresa un número válido para el país seleccionado.');
                  return;
                }
                handleSendOTP(formattedNumber);
              }}
              type='button'
              disabled={isSending || !!otpId || !phoneNumber}
              size="sm" // Standard button size
              variant="outline"
              className="w-full sm:w-auto" // Full width on mobile, auto width on sm+
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Ingresa tu número sin códigos locales (ej: sin 0 ni 15 para Argentina).
          </p>
        </div>
      </div>

      {otpId && (
        <div className="space-y-4 pt-2"> {/* Added pt-2 for spacing */}
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
            <Clock className="h-4 w-4 !text-blue-700 dark:!text-blue-300" /> {/* Ensure icon color matches */}
            <AlertTitle className="text-blue-800 dark:text-blue-200">Código enviado</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              Hemos enviado un código a tu WhatsApp. El código expira en <span className="font-medium">{formatTime(countdown)}</span>.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="otp">Código de verificación</Label>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Input
                id="otp"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                maxLength={6}
                className="w-full sm:flex-grow"
              />
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifying || otpCode.length < 6 || countdown === 0}
                size="sm" // Standard button size
                variant="default"
                className="w-full sm:w-auto"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando
                  </>
                ) : (
                  "Confirmar Código"
                )}
              </Button>
            </div>
            {countdown === 0 && otpId && (
                 <p className="text-xs text-destructive">El código OTP ha expirado. Por favor, solicita uno nuevo.</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              No compartiremos tu número de teléfono con terceros.
            </p>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                setOtpId(null);
                setOtpCode('');
                setExpiresAt(null);
                setCountdown(0);
              }}
            >
              Cancelar Ingreso de Código
            </Button>
            <Button
              variant="link" // Changed to link for a less prominent resend
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                const formattedNumber = formatNumberForWhatsApp(phoneNumber, selectedCountry);
                if (!formattedNumber) {
                  toast.error('Por favor ingresa un número válido');
                  return;
                }
                handleSendOTP(formattedNumber);
              }}
              disabled={isSending || countdown > 0} // Disable if sending or countdown active
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                "Reenviar código"
              )}
              {countdown > 0 && !isSending && ` (${formatTime(countdown)})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}