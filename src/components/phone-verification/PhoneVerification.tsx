'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BadgeCheck, Clock, AlertCircle, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { initiatePhoneVerification, verifyPhoneWithOTP } from '@/actions/profile/verify-phone'
import { AsYouType, CountryCode } from 'libphonenumber-js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { formatNumberForWhatsApp } from '@/utils/format/format-whatsapp-phone'

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
  selectedCountry,
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

  // Si el número cambia externamente, actualizar el estado
  useEffect(() => {
    setPhoneNumber(initialPhone)
  }, [initialPhone])

  // Si el estado de verificación cambia externamente, actualizar el estado
  useEffect(() => {
    setIsVerified(initialVerified)
  }, [initialVerified])

  // Gestionar cuenta regresiva para el código OTP
  useEffect(() => {
    if (!expiresAt) return

    const updateCountdown = () => {
      const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      if (remaining <= 0) {
        setCountdown(0)
        setOtpId(null)
        return
      }
      setCountdown(remaining)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  // Formatea el tiempo restante en formato mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Actualiza el estado del teléfono y notifica al padre
  const updatePhone = (phone: string) => {
    setPhoneNumber(phone)
    onVerificationChange(phone, isVerified)
  }

  // Actualiza el estado de verificación y notifica al padre
  const updateVerified = (phone: string, verified: boolean) => {
    setIsVerified(verified)
    onVerificationChange(phone, verified)
  }

  const handleSendOTP = async (formattedNumber?: string) => {
    if (!formattedNumber && !phoneNumber) {
      toast.error('Ingrese un número de teléfono válido');
      return;
    }

    setIsSending(true);
    try {
      // Usar el número ya formateado que se pasó como parámetro
      const numberToUse = formattedNumber || phoneNumber;

      // Esta llamada sería a tu server action
      const result = await initiatePhoneVerification(numberToUse);

      if (result.success) {
        if (result.data) {
          setOtpId(result.data.otpId);
          setExpiresAt(new Date(result.data.expiresAt));
        } else {
          toast.error('Error al enviar el código');
        }
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

  // Verifica el código OTP ingresado
  const handleVerifyOTP = async () => {
    if (!otpId || !otpCode) {
      toast.error('Ingrese el código de verificación')
      return
    }

    setIsVerifying(true)
    try {
      // Esta llamada sería a tu server action
      const result = await verifyPhoneWithOTP(otpId, otpCode)

      if (result.success) {
        if (result.data && result.data.verified) {
          updateVerified(phoneNumber, true)
          toast.success('Número verificado correctamente')
        } else {
          toast.error('Código incorrecto, intente nuevamente')
        }
      } else {
        toast.error(result.error?.message || 'Error al verificar el código')
      }
    } catch (error) {
      console.error('Error al verificar código:', error)
      toast.error('Error al verificar el código')
    } finally {
      setIsVerifying(false)
    }
  }

  // Si el número ya está verificado, muestra el mensaje de éxito
  if (isVerified) {
    return (
      <div className="space-y-2">
        {!hideLabel && (
          <div className="flex items-center">
            <Label htmlFor="phone" className="flex-grow">{label}</Label>
            <Badge className="ml-2 bg-green-500 hover:bg-green-600" variant="secondary">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          </div>
        )}
        <div className="flex">
          <Input
            id="phone"
            value={phoneNumber}
            onChange={(e) => updatePhone(e.target.value)}
            disabled={true}
            className="flex-grow"
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
            <Label htmlFor="phone" className="flex-grow">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
            {!otpId && (
              <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500">
                <AlertCircle className="h-3 w-3 mr-1" />
                No verificado
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-1">
          <div className="flex space-x-2">
            <Select
              value={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry && setSelectedCountry(value as CountryCode);
                // Limpiar el número actual al cambiar de país
                updatePhone('');
              }}
              disabled={!!otpId || isSending}
            >
              <SelectTrigger className="w-[140px]">
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
              id="phone"
              placeholder="Número sin 0 ni 15"
              value={phoneNumber}
              onChange={(e) => {
                // Usar AsYouType para formatear el número mientras el usuario escribe
                const formatter = new AsYouType(selectedCountry as CountryCode);
                const formattedInput = formatter.input(e.target.value);
                updatePhone(formattedInput);
              }}
              disabled={!!otpId || isSending}
              className="flex-grow"
            />

            <Button
              onClick={() => {
                const formattedNumber = formatNumberForWhatsApp(phoneNumber, selectedCountry);

                if (!formattedNumber) {
                  toast.error('Por favor ingresa un número válido');
                  return;
                }

                handleSendOTP(formattedNumber);

              }}
              type='button'
              disabled={isSending || !!otpId || !phoneNumber}
              size="sm"
              variant="outline"
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
            Ingresa tu número sin códigos locales (sin 0 ni 15 para Argentina)
          </p>
        </div>
      </div>

      {otpId && (
        <div className="space-y-4">
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <Clock className="h-4 w-4" />
            <AlertTitle>Código enviado</AlertTitle>
            <AlertDescription>
              Hemos enviado un código a tu WhatsApp. El código expira en <span className="font-medium">{formatTime(countdown)}</span>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="otp">Código de verificación</Label>
            <div className="flex space-x-2">
              <Input
                id="otp"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                maxLength={6}
                className="flex-grow"
              />
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifying || otpCode.length < 6}
                size="sm"
                variant="default"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando
                  </>
                ) : (
                  "Verificar"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No compartiremos tu número de teléfono con terceros.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOtpId(null);
                setOtpCode('');
                setExpiresAt(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const formattedNumber = formatNumberForWhatsApp(phoneNumber, selectedCountry);

                if (!formattedNumber) {
                  toast.error('Por favor ingresa un número válido');
                  return;
                }

                handleSendOTP(formattedNumber);

              }}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                "Reenviar código"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}