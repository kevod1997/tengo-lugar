'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUserStore } from '@/store/user-store'
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2Icon, TrashIcon } from "lucide-react"
import PasswordManagement from './PasswordManagement'
import { authClient } from '@/lib/auth-client'
import { LoggingService } from '@/services/logging/logging-service'
import { TipoAccionUsuario } from '@/types/actions-logs'

export default function AccountManagement() {
  const { user, clearUser } = useUserStore()
  const {data} = authClient.useSession()
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  
  const handleDeleteAccount = async () => {
    if (!user) return
    
    // Verificar confirmación
    if (deleteConfirmation !== 'ELIMINAR') {
      toast.error("Confirmación incorrecta", {
        description: "Por favor, escribe ELIMINAR para confirmar"
      });
      return;
    }
    
    setIsDeletingAccount(true)
    try {
      // Usar la función de Better Auth para eliminar la cuenta
      await authClient.deleteUser({
        callbackURL: "/"
      });
      
      // Registrar la acción (esto puede que no se ejecute si la eliminación redirige directamente)
      try {
        await LoggingService.logActionWithErrorHandling(
          {
            userId: data!.user.id,
            action: TipoAccionUsuario.CIERRE_SESION, // O crear un tipo específico para eliminación
            status: 'SUCCESS',
            details: { message: "Cuenta eliminada correctamente" }
          },
          {
            fileName: 'AccountManagement.tsx',
            functionName: 'handleDeleteAccount'
          }
        );
      } catch (logError) {
        console.error("Error al registrar eliminación de cuenta:", logError);
      }
      
      // Limpiar el estado local
      clearUser();
      
      // Mostrar mensaje de éxito (puede que no sea visible si ya redirigió)
      toast.success("Cuenta eliminada", {
        description: "Tu cuenta ha sido eliminada correctamente"
      });
      
      // Redirigir a home o login si no lo hace automáticamente
      router.push('/');
    } catch (error) {
      // Determinar el mensaje de error apropiado
      let errorMessage = "No se pudo eliminar la cuenta. Intente nuevamente.";
      
      if (error instanceof Error) {
        if (error.message.includes("password") || error.message.includes("contraseña")) {
          errorMessage = "La contraseña es incorrecta.";
        } else if (error.message.includes("session") || error.message.includes("sesión")) {
          errorMessage = "Sesión inválida o expirada. Inicia sesión nuevamente.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error("Error", {
        description: errorMessage
      });
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation('');
    }
  }
  
  return (
    <>
      {/* Password Management Component */}
      <PasswordManagement />
      
      {/* Delete Account Card */}
      <Card className="mt-6 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Eliminar cuenta</CardTitle>
          <CardDescription>
            Esta acción no puede deshacerse. Se perderán todos tus datos.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <TrashIcon className="h-4 w-4 mr-2" />
                Eliminar mi cuenta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Estás seguro de que deseas eliminar tu cuenta?</DialogTitle>
                <DialogDescription>
                  Esta acción no puede deshacerse. Se eliminarán permanentemente todos tus datos, incluyendo información personal, viajes, valoraciones y otros datos asociados a tu cuenta.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Para confirmar, escribe <strong className="font-semibold">ELIMINAR</strong> en el campo a continuación:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Escribe ELIMINAR para confirmar"
                />
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setDeleteConfirmation('');
                  }}
                  className="sm:mr-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmation !== 'ELIMINAR'}
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Confirmar eliminación
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </>
  )
}