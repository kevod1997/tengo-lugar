import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { checkPlateExists } from '@/actions/car/check-car-plate'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/registration/useDebounce'

export function usePlateValidation(plateValue: string) {
  const [plateError, setPlateError] = useState<string | null>(null)
  const [isCheckingPlate, setIsCheckingPlate] = useState(false)

  // Debounce del valor de la patente para no hacer demasiadas peticiones
  const debouncedPlate = useDebounce(plateValue, 500)

  const checkPlateMutation = useMutation({
    mutationFn: checkPlateExists,
    onMutate: () => {
      setIsCheckingPlate(true)
    },
    onSettled: () => {
      setIsCheckingPlate(false)
    },
    onSuccess: (response) => {
      console.log('Plate check response:', response)
      if (response.success && response.data?.exists) {
        setPlateError(response.data.message)
      } else {
        setPlateError(null)
      }
    },
    onError: (error) => {
      console.error('Plate check error:', error)
      toast.error('Error al verificar la patente')
    }
  })

  useEffect(() => {
    const validatePlate = async () => {
      console.log('Debounced plate value:', debouncedPlate)

      // Only check if the plate matches either format and is long enough
      if (debouncedPlate && debouncedPlate.length >= 6) {
        const platePattern = /^[A-Z0-9]{6,7}$/
        if (platePattern.test(debouncedPlate.toUpperCase())) {
          console.log('Checking plate:', debouncedPlate)
          checkPlateMutation.mutate(debouncedPlate.toUpperCase())
        }
      }
    }

    validatePlate()
  }, [debouncedPlate])

  return {
    plateError,
    isCheckingPlate,
    setPlateError,
    setIsCheckingPlate
  }
}