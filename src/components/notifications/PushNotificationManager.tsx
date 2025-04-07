// 'use client'

// import { useState, useEffect } from 'react'
// import { subscribeUser, unsubscribeUser, sendTestNotification } from '@/actions/notifications/push-notifications'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { toast } from 'sonner'
// import { useApiResponse } from '@/hooks/ui/useApiResponse'

// interface NotificationResponse {
//   sent: boolean;
//   message?: string;
//   successCount?: number;
//   total?: number;
// }

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
//   const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

//   const rawData = window.atob(base64)
//   const outputArray = new Uint8Array(rawData.length)

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i)
//   }
//   return outputArray
// }

// export function PushNotificationManager() {
//   const [isSupported, setIsSupported] = useState(false)
//   const [subscription, setSubscription] = useState<PushSubscription | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [message, setMessage] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const { handleResponse } = useApiResponse()

//   useEffect(() => {
//     if ('serviceWorker' in navigator && 'PushManager' in window) {
//       setIsSupported(true)
//       registerServiceWorker()
//     }
//   }, [])

//   async function registerServiceWorker() {
//     try {
//       const registration = await navigator.serviceWorker.register('/sw.js', {
//         scope: '/',
//         updateViaCache: 'none',
//       })
//       const sub = await registration.pushManager.getSubscription()
//       setSubscription(sub)
//     } catch (error) {
//       console.error('Service worker registration failed:', error)
//       setError('Error al registrar el service worker')
//       toast.error('Error al registrar el trabajador de servicio')
//     }
//   }

//   async function subscribeToPush() {
//     try {
//       setIsLoading(true)
//       const registration = await navigator.serviceWorker.ready

//       // Create a new subscription
//       const newSubscription = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(
//           process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
//         ),
//       })

//       setSubscription(newSubscription)

//       // Stringify and parse to get a plain object that can be passed to the server
//       const serializedSub = JSON.parse(JSON.stringify(newSubscription))

//       // Send to server
//       const result = await subscribeUser(serializedSub)
//       handleResponse(result)

//     } catch (error) {
//       console.log('Error subscribing to push:', error)
//       setError(`Error al suscribirse a notificaciones push: ${error}`)
//       toast.error('Error al suscribirse a notificaciones push')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   async function unsubscribeFromPush() {
//     try {
//       setIsLoading(true)
//       if (subscription) {
//         const endpoint = subscription.endpoint
//         await subscription.unsubscribe()
//         setSubscription(null)

//         // Tell the server to remove this subscription
//         const result = await unsubscribeUser(endpoint)
//         handleResponse(result)
//       }
//     } catch (error) {
//       console.error('Error unsubscribing from push:', error)
//       toast.error('Error al cancelar la suscripción')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   async function sendNotification() {
//     if (!message.trim()) {
//       toast.error('Por favor ingresa un mensaje');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const result = await sendTestNotification(message);

//       if (result.success && result.data) {
//         // Safely handle all possible response structures
//         const responseData = result.data as NotificationResponse;

//         if (responseData.sent) {
//           toast.success(
//             responseData.message ||
//             `Notificación enviada (${responseData.successCount}/${responseData.total})`
//           );
//         } else {
//           toast.info(
//             responseData.message ||
//             'No se pudo enviar la notificación'
//           );
//         }

//         setMessage('');
//       } else {
//         toast.error(result.message || 'Error al enviar la notificación');
//       }
//     } catch (error) {
//       console.error('Error sending notification:', error);
//       setError(`Error al enviar la notificación: ${error}`);
//       toast.error('Error al enviar la notificación');
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   if (!isSupported) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Notificaciones Push</CardTitle>
//           <CardDescription>Tu navegador no soporta notificaciones push.</CardDescription>
//         </CardHeader>
//       </Card>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Notificaciones Push</CardTitle>
//         <CardDescription>
//           {subscription
//             ? 'Estás suscrito a notificaciones push.'
//             : 'Recibe notificaciones incluso cuando no estás usando la aplicación.'}
//         </CardDescription>
//         <CardFooter className="flex justify-between">
//           {error && (
//             <p className="text-red-500 text-sm">{error}</p>
//           )}
//         </CardFooter>
//       </CardHeader>

//       <CardContent>
//         {subscription ? (
//           <div className="space-y-4">
//             <Input
//               type="text"
//               placeholder="Escribe un mensaje para probar"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//             />
//           </div>
//         ) : null}
//       </CardContent>

//       <CardFooter className="flex justify-between">
//         {subscription ? (
//           <>
//             <Button variant="outline" onClick={unsubscribeFromPush} disabled={isLoading}>
//               Cancelar suscripción
//             </Button>
//             <Button onClick={sendNotification} disabled={isLoading || !message.trim()}>
//               Enviar prueba
//             </Button>
//           </>
//         ) : (
//           <Button onClick={subscribeToPush} disabled={isLoading}>
//             Suscribirse a notificaciones
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendTestNotification } from '@/actions/notifications/push-notifications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { AlertCircle, Info } from 'lucide-react'

interface NotificationResponse {
  sent: boolean;
  message?: string;
  successCount?: number;
  total?: number;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
  const { handleResponse } = useApiResponse()

  useEffect(() => {
    // Detect mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ))

    // Check iOS Safari version
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isIOSSafari = isIOS && navigator.userAgent.includes('Safari')
    
    if (isIOSSafari) {
      const iosMatch = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/)
      if (iosMatch) {
        const iosVersion = parseFloat(iosMatch[1] + '.' + iosMatch[2])
        
        if (iosVersion < 16.4) {
          setError('Tu versión de iOS no soporta notificaciones web. Actualiza a iOS 16.4 o superior.')
          setIsSupported(false)
          return
        }
      }
    }

    // Check if secure context (HTTPS)
    if (!window.isSecureContext) {
      setError('Las notificaciones requieren una conexión segura (HTTPS).')
      setIsSupported(false)
      return
    }

    // Check notification support
    if ('Notification' in window) {
      setPermissionState(Notification.permission)
      
      // Set up permission change listener if supported
      navigator.permissions?.query({ name: 'notifications' as PermissionName }).then(status => {
        status.onchange = () => {
          setPermissionState(Notification.permission)
        }
      })
    }

    // Check service worker and push manager support
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    } else {
      setIsSupported(false)
      setError('Tu navegador no soporta notificaciones push.')
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      
      // Wait for service worker to be ready and active
      if (registration.installing) {
        const worker = registration.installing
        worker.addEventListener('statechange', async () => {
          if (worker.state === 'activated') {
            const sub = await registration.pushManager.getSubscription()
            setSubscription(sub)
          }
        })
      } else {
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
      }
    } catch (error) {
      console.error('Service worker registration failed:', error)
      setError(`Error al registrar el service worker: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      toast.error('Error al registrar el trabajador de servicio')
    }
  }

  // First step for mobile - show information dialog
  function initiatePermissionRequest() {
    setShowPermissionPrompt(true)
  }

  // Second step - actually request permission after confirmation
  function confirmAndRequestPermissions() {
    setShowPermissionPrompt(false)
    subscribeToPush()
  }

  async function subscribeToPush() {
    try {
      setIsLoading(true)
      setError(null)
      
      // First explicitly request notification permission
      const permissionResult = await Notification.requestPermission()
      setPermissionState(permissionResult)
      
      if (permissionResult !== 'granted') {
        throw new Error('Permiso de notificaciones denegado')
      }
      
      // Then proceed with the subscription
      const registration = await navigator.serviceWorker.ready
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      
      setSubscription(newSubscription)
      
      // Send to server
      const serializedSub = JSON.parse(JSON.stringify(newSubscription))
      const result = await subscribeUser(serializedSub)
      handleResponse(result)
      
      toast.success('¡Notificaciones activadas correctamente!')
    } catch (error) {
      console.error('Error subscribing to push:', error)
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setError('Permiso denegado para recibir notificaciones. Por favor, actívalas en la configuración de tu navegador.')
        toast.error('Permiso de notificaciones denegado')
      } else {
        setError(`Error al suscribirse: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        toast.error('Error al suscribirse a notificaciones push')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true)
      setError(null)
      
      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        setSubscription(null)
        
        // Tell the server to remove this subscription
        const result = await unsubscribeUser(endpoint)
        handleResponse(result)
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      setError(`Error al cancelar suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      toast.error('Error al cancelar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  async function sendNotification() {
    if (!message.trim()) {
      toast.error('Por favor ingresa un mensaje')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await sendTestNotification(message)
      
      if (result.success && result.data) {
        const responseData = result.data as NotificationResponse
        
        if (responseData.sent) {
          toast.success(
            responseData.message ||
            `Notificación enviada (${responseData.successCount}/${responseData.total})`
          )
        } else {
          toast.info(
            responseData.message ||
            'No se pudo enviar la notificación'
          )
        }
        
        setMessage('')
      } else {
        toast.error(result.message || 'Error al enviar la notificación')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      setError(`Error al enviar la notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      toast.error('Error al enviar la notificación')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Push</CardTitle>
          <CardDescription>Tu navegador no soporta notificaciones push.</CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <div className="flex items-start gap-2 text-amber-500">
              <Info className="h-5 w-5 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // Render different UI based on permission state
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones Push</CardTitle>
        <CardDescription>
          {subscription
            ? 'Estás suscrito a notificaciones push.'
            : permissionState === 'denied'
              ? 'Has bloqueado las notificaciones para este sitio.'
              : 'Recibe notificaciones incluso cuando no estás usando la aplicación.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="flex items-start gap-2 text-amber-500 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Permission confirmation dialog for mobile */}
        {showPermissionPrompt && (
          <div className="p-4 border rounded-md bg-muted/50 mb-4">
            <h4 className="font-medium mb-2">Permitir notificaciones</h4>
            <p className="text-sm mb-4">
              Para recibir notificaciones sobre tus viajes, necesitamos tu permiso.
              Aparecerá un diálogo del navegador a continuación.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPermissionPrompt(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmAndRequestPermissions}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Show instructions for denied permissions */}
        {permissionState === 'denied' && (
          <div className="space-y-2 mb-4">
            <p className="text-sm">
              Has bloqueado las notificaciones para este sitio. Para recibirlas, deberás cambiar la configuración en tu navegador.
            </p>
            {isMobile && (
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Ve a la configuración de tu navegador</li>
                <li>Busca la sección de Permisos o Configuración de sitios</li>
                <li>Encuentra este sitio y cambia el permiso de notificaciones</li>
              </ul>
            )}
          </div>
        )}
      
        {subscription && (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Escribe un mensaje para probar"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {subscription ? (
          <>
            <Button variant="outline" onClick={unsubscribeFromPush} disabled={isLoading}>
              Cancelar suscripción
            </Button>
            <Button onClick={sendNotification} disabled={isLoading || !message.trim()}>
              Enviar prueba
            </Button>
          </>
        ) : permissionState === 'denied' ? (
          <Button variant="outline" onClick={() => window.open('about:settings')}>
            Abrir configuración del navegador
          </Button>
        ) : (
          <Button 
            onClick={isMobile ? initiatePermissionRequest : subscribeToPush} 
            disabled={isLoading}
          >
            Suscribirse a notificaciones
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}