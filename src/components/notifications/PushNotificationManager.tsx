// 'use client'

// import { useState, useEffect } from 'react'
// import { subscribeUserToPush, unsubscribeUserFromPush } from '@/actions/notifications/push-notifications'
// import { toast } from 'sonner'
// import { Button } from '@/components/ui/button'
// import { Loader2 } from 'lucide-react'

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

// export default function PushNotificationManager() {
//   const [isSupported, setIsSupported] = useState(false)
//   const [subscription, setSubscription] = useState<PushSubscription | null>(null)
//   const [loading, setLoading] = useState(false)

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
//       })
//       const sub = await registration.pushManager.getSubscription()
//       setSubscription(sub)
//     } catch (error) {
//       console.error('Service worker registration failed:', error)
//     }
//   }

//   async function subscribeToPush() {
//     setLoading(true)
//     try {
//       const registration = await navigator.serviceWorker.ready

//       const sub = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(
//           process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
//         ),
//       })

//       setSubscription(sub)

//       // Send the subscription to the server
//       const serializedSub = JSON.parse(JSON.stringify(sub))
//       const result = await subscribeUserToPush(serializedSub)
//       if (result.success) {
//         toast.success('Te has suscrito a las notificaciones')
//       } else {
//         toast.error('Error al suscribirse a las notificaciones')
//       }
//     } catch (error) {
//       console.error('Failed to subscribe to push notifications:', error)
//       toast.error('No se pudo suscribir a las notificaciones')
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function unsubscribeFromPush() {
//     setLoading(true)
//     if (subscription) {
//       try {
//         const endpoint = subscription.endpoint
//         await subscription.unsubscribe()
//         setSubscription(null)
//         const result = await unsubscribeUserFromPush(endpoint)
//         if (result.success) {
//           toast.success('Has cancelado la suscripción a notificaciones')
//         } else {
//           toast.error('Error al cancelar la suscripción')
//         }
//       } catch (error) {
//         console.error('Failed to unsubscribe:', error)
//         toast.error('No se pudo cancelar la suscripción')
//       } finally {
//         setLoading(false)
//       }
//     }
//   }

//   if (!isSupported) {
//     return (
//       <div className="rounded-md border p-4 bg-background/50">
//         <p className="text-muted-foreground">Tu navegador no soporta notificaciones push</p>
//       </div>
//     )
//   }

//   return (
//     <div className="rounded-md border p-4 mt-6">
//       <h3 className="text-lg font-medium mb-2">Notificaciones</h3>
//       <p className="text-sm text-muted-foreground mb-4">
//         Recibe notificaciones sobre tus viajes, incluso cuando no estés usando la aplicación.
//       </p>

//       {subscription ? (
//         <Button 
//           onClick={unsubscribeFromPush} 
//           variant="destructive" 
//           disabled={loading}
//         >
//           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//           Desactivar notificaciones
//         </Button>
//       ) : (
//         <Button 
//           onClick={subscribeToPush} 
//           variant="default" 
//           disabled={loading}
//         >
//           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//           Activar notificaciones
//         </Button>
//       )}
//     </div>
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
import { set } from 'zod'

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
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { handleResponse } = useApiResponse()

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service worker registration failed:', error)
      setError('Error al registrar el service worker')
      toast.error('Error al registrar el trabajador de servicio')
    }
  }

  async function subscribeToPush() {
    try {
      setIsLoading(true)
      const registration = await navigator.serviceWorker.ready

      // Create a new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      setSubscription(newSubscription)

      // Stringify and parse to get a plain object that can be passed to the server
      const serializedSub = JSON.parse(JSON.stringify(newSubscription))

      // Send to server
      const result = await subscribeUser(serializedSub)
      handleResponse(result)

    } catch (error) {
      console.log('Error subscribing to push:', error)
      setError(`Error al suscribirse a notificaciones push: ${error}`)
      toast.error('Error al suscribirse a notificaciones push')
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true)
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
      toast.error('Error al cancelar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  async function sendNotification() {
    if (!message.trim()) {
      toast.error('Por favor ingresa un mensaje');
      return;
    }

    try {
      setIsLoading(true);
      const result = await sendTestNotification(message);

      if (result.success && result.data) {
        // Safely handle all possible response structures
        const responseData = result.data as NotificationResponse;

        if (responseData.sent) {
          toast.success(
            responseData.message ||
            `Notificación enviada (${responseData.successCount}/${responseData.total})`
          );
        } else {
          toast.info(
            responseData.message ||
            'No se pudo enviar la notificación'
          );
        }

        setMessage('');
      } else {
        toast.error(result.message || 'Error al enviar la notificación');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(`Error al enviar la notificación: ${error}`);
      toast.error('Error al enviar la notificación');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Push</CardTitle>
          <CardDescription>Tu navegador no soporta notificaciones push.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones Push</CardTitle>
        <CardDescription>
          {subscription
            ? 'Estás suscrito a notificaciones push.'
            : 'Recibe notificaciones incluso cuando no estás usando la aplicación.'}
        </CardDescription>
        <CardFooter className="flex justify-between">
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </CardFooter>
      </CardHeader>

      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Escribe un mensaje para probar"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        ) : null}
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
        ) : (
          <Button onClick={subscribeToPush} disabled={isLoading}>
            Suscribirse a notificaciones
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
