import Header from "@/components/header/header"
// import { PushNotificationManager } from "@/components/notifications/PushNotificationManager"

export default function Page() {
  
  return (
    <>
    <Header breadcrumbs={[{ label: 'Inicio', href: '/' }]} showBackButton={false} />
    <div className="container mx-auto py-8">
      {/* <h1 className="text-3xl font-bold mb-8">Gestión de notificaciones</h1> */}
      {/* {isMounted ? <PushNotificationManager /> : <div>Cargando gestor de notificaciones...</div>} */}
    </div>
    </>
  )
}