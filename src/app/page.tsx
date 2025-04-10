'use client'

import { useEffect, useState } from 'react'
import Header from "@/components/header/header"
import { PushNotificationManager } from "@/components/notifications/PushNotificationManager"

export default function Page() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  return (
    <>
    <Header breadcrumbs={[{ label: 'Home', href: '/' }]} showBackButton={false} />
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de notificaciones</h1>
      {isMounted ? <PushNotificationManager /> : <div>Cargando gestor de notificaciones...</div>}
    </div>
    </>
  )
}