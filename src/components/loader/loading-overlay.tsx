// 'use client'

// import { Spinner } from "./spinner"

// interface LoadingOverlayProps {
//   isLoading: boolean
// }

// export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
//   if (!isLoading) return null

//   return (
//     <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
//       <Spinner size="lg" />
//     </div>
//   )
// }

// ✅ LoadingOverlay.tsx - Optimizado para LoadingStore
'use client'

import type { LoadingOperation } from '@/store/loadingStore';
import { useLoadingStore } from '@/store/loadingStore'

import { Spinner } from "./spinner"

interface LoadingOverlayProps {
  // ✅ Especifica qué operaciones deben mostrar overlay global
  overlayOperations?: LoadingOperation[]
  // ✅ Personalizar mensaje si no quieres usar el del store
  customMessage?: string
  forceShow?: boolean
  // ✅ Personalizar el fondo
  className?: string
}

export function LoadingOverlay({ 
  overlayOperations = ['authRedirect', 'authenticatingUser', 'signingOut'],
  customMessage,
  forceShow = false,
  className = "fixed inset-0 bg-background/80 flex items-center justify-center z-50"
}: LoadingOverlayProps) {
  const { isLoading, getLoadingMessage } = useLoadingStore()

  // ✅ Verificar si alguna operación de overlay está activa
  const activeOperation = overlayOperations.find(operation => isLoading(operation))
  
   if (!activeOperation && !forceShow) return null

  // ✅ Obtener mensaje de la operación activa o usar custom
 const message = customMessage || 
    (activeOperation ? getLoadingMessage(activeOperation) : 'Cargando...')

  return (
    <div className={className}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-3">
          <Spinner size="lg" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}

// ✅ Para páginas específicas que necesitan loading diferente
export function PageLoadingOverlay() {
  return (
    <LoadingOverlay 
      overlayOperations={['fetchingUserData', 'uploadingDocument']}
      className="absolute inset-0 bg-white/90 flex items-center justify-center z-40"
    />
  )
}

// ✅ Para operaciones de viaje
export function TripLoadingOverlay() {
  return (
    <LoadingOverlay 
      overlayOperations={['calculatingRoute', 'creatingTrip']}
      customMessage="Preparando tu viaje..."
    />
  )
}

// ✅ Loading inline para botones específicos
export function InlineLoading({ operation }: { operation: LoadingOperation }) {
  const { isLoading } = useLoadingStore()
  
  if (!isLoading(operation)) return null
  
  return <Spinner size="sm" className="ml-2" />
}