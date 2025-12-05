'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { verifyBankAccount } from '@/actions/admin/bank-account/verify-bank-account'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface VerifyBankAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankAccountId: string | null
  bankAlias: string
  userName: string
}

export function VerifyBankAccountDialog({
  open,
  onOpenChange,
  bankAccountId,
  bankAlias,
  userName,
}: VerifyBankAccountDialogProps) {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    if (!bankAccountId) return

    setIsVerifying(true)

    try {
      const result = await verifyBankAccount(bankAccountId)

      if (result.success) {
        toast.success('Cuenta verificada', {
          description: result.message || 'La cuenta bancaria ha sido verificada exitosamente'
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error('Error al verificar', {
          description: typeof result.error === 'string' ? result.error : 'No se pudo verificar la cuenta bancaria'
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al verificar cuenta bancaria'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verificar Datos Bancarios</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Confirmas que has verificado el alias bancario <strong>{bankAlias}</strong> para el usuario <strong>{userName}</strong>?
          </AlertDialogDescription>
          <p className="text-sm text-destructive font-medium">
            Esta acción no se puede deshacer.
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isVerifying}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleVerify()
            }}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
