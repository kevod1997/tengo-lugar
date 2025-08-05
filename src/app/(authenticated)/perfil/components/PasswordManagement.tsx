// src/app/perfil/componenetes/PasswordManagement.tsx
'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2Icon, KeyIcon, LinkIcon } from 'lucide-react'
import { updatePassword, setPasswordForSocialAccount } from '@/actions/profile/update-password'
import { authClient } from '@/lib/auth-client'
import { Skeleton } from '@/components/ui/skeleton'

// Definimos el tipo para las cuentas
interface Account {
  id: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  scopes: string[];
  password?: string; // Opcional, ya que las cuentas sociales no tendrán password
}

// Tipo para la respuesta de listAccounts
interface AccountsResponse {
  data: Account[];
  error: null | any;
}

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(32, "La nueva contraseña no puede exceder 32 caracteres"),
  confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

const addPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(32, "La nueva contraseña no puede exceder 32 caracteres"),
  confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export default function PasswordManagement() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAddPasswordDialogOpen, setIsAddPasswordDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estados para las cuentas
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [accountsFetched, setAccountsFetched] = useState(false);
  
  // Usamos useEffect para cargar las cuentas cuando cambie la sesión
  useEffect(() => {
    let isMounted = true;
    
    async function fetchAccounts() {
      if (!session || isSessionPending) return;
      
      if (accountsFetched) return; // Evitar múltiples solicitudes
      
      try {
        setAccountsLoading(true);
        setAccountsError(null);
        
        const response = await authClient.listAccounts() as AccountsResponse;
        
        if (!isMounted) return;
        
        // Verificamos la estructura y existencia de datos
        if (response && response.data) {
          setAccounts(response.data);
        } else {
          console.warn("Estructura de respuesta inesperada:", response);
          setAccounts([]);
          setAccountsError("No se pudieron obtener los métodos de acceso");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching accounts:", error);
        setAccounts([]);
        setAccountsError("Error al obtener los métodos de acceso");
      } finally {
        if (isMounted) {
          setAccountsLoading(false);
          setAccountsFetched(true);
        }
      }
    }
    
    fetchAccounts();
    
    return () => {
      isMounted = false;
    };
  }, [session, isSessionPending, accountsFetched]);
  
  // Determinar si el usuario tiene una cuenta con contraseña
  const hasPasswordAccount = accounts.some(account => 
    account.provider === 'credential'
  );

  
  // Determinar si el usuario tiene cuentas sociales
  // const hasSocialAccounts = accounts.some(account => 
  //   account.provider !== 'credential'
  // );
  
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const addPasswordForm = useForm<z.infer<typeof addPasswordSchema>>({
    resolver: zodResolver(addPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const handleUpdatePassword = async (values: z.infer<typeof passwordFormSchema>) => {
    setIsUpdating(true);
    try {
      const result = await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      
      if (result.success) {
        // Fetch fresh session data
        await authClient.getSession({
          query: { disableCookieCache: true }
        });
        
        // No need to change any state related to passwords since
        // we're just updating an existing password, not adding a new auth method
        
        toast.success("Contraseña actualizada", {
          description: "Tu contraseña ha sido actualizada correctamente"
        });
        
        setIsPasswordDialogOpen(false);
        passwordForm.reset();
      } else if (result.error) {
        toast.error("Error", {
          description: result.error.message || "No se pudo actualizar la contraseña"
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudo actualizar la contraseña"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddPassword = async (values: z.infer<typeof addPasswordSchema>) => {
    setIsUpdating(true);
    try {
      const result = await setPasswordForSocialAccount({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      
      if (result.success) {
        // Fetch fresh session data
        await authClient.getSession({
          query: { disableCookieCache: true }
        });
        
        // Update accounts state locally to reflect the new credential account
        setAccounts(prevAccounts => [
          ...prevAccounts,
          {
            id: `credential-${Date.now()}`, // Generate a temporary ID
            provider: 'credential',
            accountId: session?.user.email || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            scopes: []
          }
        ]);
        
        // This will cause the UI to update since hasPasswordAccount depends on accounts
        
        toast.success("Método de acceso añadido", {
          description: "Ahora también podrás acceder utilizando tu correo y contraseña"
        });
        
        setIsAddPasswordDialogOpen(false);
        addPasswordForm.reset();
      } else if (result.error) {
        toast.error("Error", {
          description: result.error.message || "No se pudo añadir el método de acceso"
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudo añadir el método de acceso"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Si no hay sesión activa, no mostramos nada
  if (!session || isSessionPending) return null;

  // Renderizado condicional basado en estado de carga
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Gestión de contraseña</CardTitle>
        <CardDescription>
          {accountsLoading 
            ? "Cargando información de la cuenta..."
            : hasPasswordAccount 
              ? "Puedes actualizar tu contraseña para mejorar la seguridad de tu cuenta"
              : "Añade una contraseña para poder acceder con tu email"}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {accountsLoading ? (
          // Mostrar esqueleto de carga mientras se obtienen las cuentas
          <Skeleton className="h-10 w-32" />
        ) : accountsError ? (
          // Mostrar mensaje de error
          <div className="text-sm text-destructive">
            {accountsError}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => {
                setAccountsFetched(false); // Permitir intentar de nuevo
              }}
            >
              Reintentar
            </Button>
          </div>
        ) : hasPasswordAccount ? (
          // Usuario tiene cuenta con contraseña
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <KeyIcon className="h-4 w-4 mr-2" />
                Cambiar contraseña
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar contraseña</DialogTitle>
                <DialogDescription>
                  Ingresa tu contraseña actual y la nueva contraseña para actualizarla
                </DialogDescription>
              </DialogHeader>
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        setIsPasswordDialogOpen(false);
                        passwordForm.reset();
                      }}
                      className="sm:mr-auto"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : 'Actualizar contraseña'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        ) : (
          // Usuario sin cuenta de contraseña
          <Dialog open={isAddPasswordDialogOpen} onOpenChange={setIsAddPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="h-4 w-4 mr-2" />
                Añadir acceso por contraseña
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar acceso por contraseña</DialogTitle>
                <DialogDescription>
                  Añade una contraseña para poder acceder a tu cuenta con tu correo electrónico
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addPasswordForm}>
                <form onSubmit={addPasswordForm.handleSubmit(handleAddPassword)} className="space-y-4">
                  <FormField
                    control={addPasswordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        setIsAddPasswordDialogOpen(false);
                        addPasswordForm.reset();
                      }}
                      className="sm:mr-auto"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Configurando...
                        </>
                      ) : 'Configurar contraseña'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}