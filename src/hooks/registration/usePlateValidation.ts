// import { useState, useEffect } from 'react'
// import { useMutation } from '@tanstack/react-query'
// import { checkPlateExists } from '@/actions/car/check-car-plate'
// import { toast } from 'sonner'
// import { useDebounce } from '@/hooks/registration/useDebounce'

// export function usePlateValidation(plateValue: string) {
//   const [plateError, setPlateError] = useState<string | null>(null)
//   const [isCheckingPlate, setIsCheckingPlate] = useState(false)

//   // Debounce del valor de la patente para no hacer demasiadas peticiones
//   const debouncedPlate = useDebounce(plateValue, 500)

//   const checkPlateMutation = useMutation({
//     mutationFn: checkPlateExists,
//     onMutate: () => {
//       setIsCheckingPlate(true)
//     },
//     onSettled: () => {
//       setIsCheckingPlate(false)
//     },
//     onSuccess: (response) => {
//       console.log('Plate check response:', response)
//       if (response.success && response.data?.exists) {
//         setPlateError(response.data.message)
//       } else {
//         setPlateError(null)
//       }
//     },
//     onError: (error) => {
//       console.error('Plate check error:', error)
//       toast.error('Error al verificar la patente')
//     }
//   })

//   useEffect(() => {
//     const validatePlate = async () => {
//       console.log('Debounced plate value:', debouncedPlate)

//       // Only check if the plate matches either format and is long enough
//       if (debouncedPlate && debouncedPlate.length >= 6) {
//         const platePattern = /^[A-Z0-9]{6,7}$/
//         if (platePattern.test(debouncedPlate.toUpperCase())) {
//           console.log('Checking plate:', debouncedPlate)
//           checkPlateMutation.mutate(debouncedPlate.toUpperCase())
//         }
//       }
//     }

//     validatePlate()
//   }, [debouncedPlate, checkPlateMutation])

//   return {
//     plateError,
//     isCheckingPlate,
//     setPlateError,
//     setIsCheckingPlate
//   }
// }

import { useState, useRef, useCallback, useEffect } from 'react'

import { checkPlateExists } from '@/actions/car/check-car-plate'

export function usePlateValidation(initialPlate = '') {
  // State for display value that React Hook Form will use
  const [plate, setPlate] = useState(initialPlate)
  // States for validation
  const [isValidating, setIsValidating] = useState(false)
  const [plateError, setPlateError] = useState<string | null>(null)

  // Refs to avoid unnecessary re-renders
  const currentValueRef = useRef(initialPlate)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Validation helpers
  const shouldValidateFormat = (value: string) => {
    return value.length >= 6 && /^[A-Za-z0-9]{6,7}$/.test(value.toUpperCase())
  }

  // Debounced validation logic - extracted to avoid duplication
  const validatePlate = useCallback(async (value: string) => {
    if (!shouldValidateFormat(value)) {
      // Return early if format is invalid but we have enough characters
      if (value.length >= 6) {
        setPlateError('Formato de patente inválido')
      }
      return
    }

    try {
      setIsValidating(true)
      const response = await checkPlateExists(value)

      if (response.success && response.data?.exists) {
        setPlateError(response.data.message)
      } else {
        setPlateError(null)
      }
    } catch (error) {
      console.error('Plate validation error:', error)
      setPlateError('Error al verificar la patente')
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Optimized input handler
  const handlePlateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()

    // Store latest value in ref (doesn't cause re-render)
    currentValueRef.current = newValue

    // Update display value (causes re-render, but needed for controlled component)
    setPlate(newValue)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Clear error for short input
    if (newValue.length < 6) {
      setPlateError(null)
      return
    }

    // Set timeout for validation
    timeoutRef.current = setTimeout(() => {
      // Use the ref value to ensure we're validating the latest input
      validatePlate(currentValueRef.current)
    }, 800)
  }, [validatePlate])

  // Manual reset function
  const resetValidation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    currentValueRef.current = ''
    setPlate('')
    setPlateError(null)
    setIsValidating(false)
  }, [])

  // Manual validation function for form submission
  const validateNow = useCallback(async () => {
    // Cancel any pending validation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const value = currentValueRef.current

    if (!shouldValidateFormat(value)) {
      setPlateError('Formato de patente inválido')
      return { isValid: false, error: 'Formato de patente inválido' }
    }

    try {
      setIsValidating(true)
      const response = await checkPlateExists(value)
      const isValid = !(response.success && response.data?.exists)
      const error = isValid ? null : response.data?.message

      setPlateError(error || null)
      return { isValid, error }
    } catch (error) {
      //todo log error to a service
      console.error('Plate validation error:', error)
      const errorMsg = 'Error al verificar la patente'
      setPlateError(errorMsg)
      return { isValid: false, error: errorMsg }
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    plate,
    plateError,
    isValidating,
    resetValidation,
    validateNow,
    handlePlateChange
  }
}