'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { InfoIcon, Loader2Icon, Building2 } from 'lucide-react'
import { getBankAccount, createOrUpdateBankAlias } from '@/actions/user/bank-account'
import { bankAccountSchema, BankAccountFormData } from '@/schemas/validation/bank-account-schema'

interface BankAccountWidgetProps {
  phoneNumber: string | null | undefined
}

export default function BankAccountWidget({ phoneNumber }: BankAccountWidgetProps) {
  const queryClient = useQueryClient()

  // Fetch bank account data
  const { data: response, isLoading } = useQuery({
    queryKey: ['bankAccount'],
    queryFn: getBankAccount,
    enabled: !!phoneNumber, // Only fetch if user has phone number
  })

  const bankAccount = response?.data

  // Form setup
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankAlias: bankAccount?.bankAlias || '',
    },
    values: bankAccount ? {
      bankAlias: bankAccount.bankAlias,
    } : undefined,
  })

  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: createOrUpdateBankAlias,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['bankAccount'] })
        toast.success(result.message || 'Datos bancarios guardados exitosamente')
      } else {
        toast.error('Error', {
          description: typeof result.error === 'string' ? result.error : 'No se pudieron guardar los datos bancarios'
        })
      }
    },
    onError: (error) => {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al guardar datos bancarios'
      })
    }
  })

  // Handle form submission
  const onSubmit = (data: BankAccountFormData) => {
    mutation.mutate(data)
  }

  // Don't render if no phone number
  if (!phoneNumber) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Datos Bancarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasAccount = !!bankAccount
  const isVerified = bankAccount?.isVerified || false

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Datos Bancarios
          </CardTitle>
          {hasAccount && (
            <Badge variant={isVerified ? 'default' : 'secondary'} className={isVerified ? 'bg-green-500' : 'bg-yellow-500'}>
              {isVerified ? 'Verificado ✓' : 'Pendiente de verificación'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Información importante</AlertTitle>
          <AlertDescription>
            La cuenta bancaria debe estar a tu nombre. El alias será verificado por nuestro equipo antes de poder recibir pagos.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankAlias">Alias bancario (CVU/CBU)</Label>
            <Input
              id="bankAlias"
              placeholder="tu.alias.bancario"
              {...register('bankAlias')}
              disabled={mutation.isPending}
            />
            {errors.bankAlias && (
              <p className="text-sm text-destructive">{errors.bankAlias.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres. Solo letras, números, puntos, guiones y guiones bajos.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            {hasAccount && isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={mutation.isPending || (!hasAccount && !isDirty) || (hasAccount && !isDirty)}
            >
              {mutation.isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : hasAccount ? (
                'Actualizar alias'
              ) : (
                'Guardar alias'
              )}
            </Button>
          </div>

          {hasAccount && isVerified && isDirty && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription>
                Al modificar tu alias bancario, tu cuenta deberá ser verificada nuevamente.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
