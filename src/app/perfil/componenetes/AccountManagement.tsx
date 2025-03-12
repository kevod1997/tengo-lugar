// src/app/profile/components/AccountManagement.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUserStore } from '@/store/user-store'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2Icon, TrashIcon } from "lucide-react"

export default function AccountManagement() {
  const { user, clearUser } = useUserStore()
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleDeleteAccount = async () => {
    if (!user) return
    
    setIsDeletingAccount(true)
    try {
      // Here you would implement the actual account deletion logic
      // For example:
      // const response = await fetch('/api/account/delete', {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: user.id })
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Clear user from store
      clearUser()
      
      toast.success("Cuenta eliminada", {
        description: "Tu cuenta ha sido eliminada correctamente"
      })
      
      // Redirect to home or login page
      router.push('/')
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo eliminar la cuenta. Intente nuevamente."
      })
    } finally {
      setIsDeletingAccount(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Si deseas cambiar tu contraseña, puedes hacerlo desde aquí.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => {
              toast.info('Funcionalidad en desarrollo')
            }}
          >
            Cambiar contraseña
          </Button>
        </CardFooter>
      </Card>

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
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="sm:mr-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
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