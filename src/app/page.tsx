
'use client'

import Header from "@/components/header/header"
import { PushNotificationManager } from "@/components/notifications/PushNotificationManager"

export default function Page() {
  return (
    <>
    <Header breadcrumbs={[{ label: 'Home', href: '/' }]} showBackButton={false} />
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de notificaciones</h1>
      <PushNotificationManager />
      {/* Other components */}
    </div>
    </>
  )
}