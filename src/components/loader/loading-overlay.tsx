'use client'

import { Spinner } from "./spinner"

interface LoadingOverlayProps {
  isLoading: boolean
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <Spinner size="lg" />
    </div>
  )
}