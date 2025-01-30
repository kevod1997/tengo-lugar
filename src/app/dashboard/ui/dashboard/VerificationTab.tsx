import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, XCircle, AlertTriangle } from 'lucide-react'
import { FormattedUser } from "@/types/user-types"

interface VerificationTabProps {
  user: FormattedUser
  setShowIdVerification: (show: boolean) => void
}

export function VerificationTab({ user, setShowIdVerification }: VerificationTabProps) {
  
  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="text-green-500" />
      case 'PENDING':
        return <Loader2 className="animate-spin text-blue-500" />
      case 'FAILED':
        return <XCircle className="text-red-500" />
      default:
        return <AlertTriangle className="text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(user.identityStatus ?? undefined)}
          Verificación de Identidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!user.identityStatus && (
          <>
            <p className="mb-4">Complete el proceso de verificación de identidad para acceder a todas las funciones.</p>
            <Button className="w-full" onClick={() => setShowIdVerification(true)}>
              Completar Verificación
            </Button>
          </>
        )}
        {user.identityStatus === 'PENDING' && (
          <p>Su verificación de identidad está en proceso. Le notificaremos cuando esté completa.</p>
        )}
        {user.identityStatus === 'VERIFIED' && (
          <p>Su identidad ha sido verificada exitosamente.</p>
        )}
        {user.identityStatus === 'FAILED' && (
          <>
            <p>Lo sentimos, la verificación de su identidad ha fallado. Motivo: {user.identityFailureReason || 'No especificado'}.</p>
            <p className="mt-2">Por favor, vuelva a subir sus documentos de identidad.</p>
            <Button onClick={() => setShowIdVerification(true)} className="w-full mt-4">
              Volver a Subir Documentos
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

