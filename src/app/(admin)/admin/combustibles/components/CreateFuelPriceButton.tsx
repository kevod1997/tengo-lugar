'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateFuelPriceDialog } from './CreateFuelPriceDialog'

export function CreateFuelPriceButton() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)

  const handleSuccess = () => {
    setShowDialog(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Precio
      </Button>

      <CreateFuelPriceDialog
        open={showDialog}
        onSuccess={handleSuccess}
        onCancel={() => setShowDialog(false)}
      />
    </>
  )
}
