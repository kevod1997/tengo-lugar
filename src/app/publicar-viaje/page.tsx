'use client'

import { useUserStore } from "@/store/user-store"
import { useRouter } from "next/navigation"
// import { useEffect } from "react"

export default function PublicarViajePage() {
  const { user } = useUserStore()
  const router = useRouter()
  
//   useEffect(() => {
//     if (!user?.hasEnabledCar) {
//       router.push('/dashboard?error=no-enabled-car')
//     }
//   }, [user, router])
  
  if (!user?.hasEnabledCar) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">No puedes publicar un viaje</h1>
        <p className="text-gray-600 mb-6">
          Para publicar un viaje, necesitas tener un vehículo completamente habilitado.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 w-full max-w-md">
          <h2 className="font-semibold text-amber-800 mb-2">¿Qué necesitas para habilitar tu vehículo?</h2>
          <ul className="list-disc list-inside text-amber-700 space-y-1">
            <li>Tener la información de combustible completa</li>
            <li>Tener una tarjeta verde o azul verificada</li>
            <li>Tener un seguro verificado</li>
            <li>No tener documentos pendientes de verificación</li>
          </ul>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Volver al Dashboard
        </button>
      </div>
    )
  }
  
  return (
   <div>
        {/* Aquí va el formulario de publicar viaje */}
   </div>
  )
}