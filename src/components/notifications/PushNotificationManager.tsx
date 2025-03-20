'use client'

import { useState, useEffect } from 'react'
import { subscribeUserToPush, unsubscribeUserFromPush } from '@/actions/notifications/push-notifications'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

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

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  
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
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }
  
  async function subscribeToPush() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      
      setSubscription(sub)
      
      // Send the subscription to the server
      const serializedSub = JSON.parse(JSON.stringify(sub))
      const result = await subscribeUserToPush(serializedSub)
      if (result.success) {
        toast.success('Te has suscrito a las notificaciones')
      } else {
        toast.error('Error al suscribirse a las notificaciones')
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      toast.error('No se pudo suscribir a las notificaciones')
    } finally {
      setLoading(false)
    }
  }
  
  async function unsubscribeFromPush() {
    setLoading(true)
    if (subscription) {
      try {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        setSubscription(null)
        const result = await unsubscribeUserFromPush(endpoint)
        if (result.success) {
          toast.success('Has cancelado la suscripción a notificaciones')
        } else {
          toast.error('Error al cancelar la suscripción')
        }
      } catch (error) {
        console.error('Failed to unsubscribe:', error)
        toast.error('No se pudo cancelar la suscripción')
      } finally {
        setLoading(false)
      }
    }
  }
  
  if (!isSupported) {
    return (
      <div className="rounded-md border p-4 bg-background/50">
        <p className="text-muted-foreground">Tu navegador no soporta notificaciones push</p>
      </div>
    )
  }
  
  return (
    <div className="rounded-md border p-4 mt-6">
      <h3 className="text-lg font-medium mb-2">Notificaciones</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Recibe notificaciones sobre tus viajes, incluso cuando no estés usando la aplicación.
      </p>
      
      {subscription ? (
        <Button 
          onClick={unsubscribeFromPush} 
          variant="destructive" 
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Desactivar notificaciones
        </Button>
      ) : (
        <Button 
          onClick={subscribeToPush} 
          variant="default" 
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Activar notificaciones
        </Button>
      )}
    </div>
  )
}