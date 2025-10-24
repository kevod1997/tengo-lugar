import { LoadingOverlay } from '@/components/loader/loading-overlay'

export default function Loading() {
  return <LoadingOverlay forceShow customMessage="Cargando datos bancarios..." />
}
