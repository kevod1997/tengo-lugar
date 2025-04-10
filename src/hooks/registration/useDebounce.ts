// import { useEffect, useState } from 'react'

// export function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value)

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value)
//     }, delay)

//     return () => {
//       clearTimeout(handler)
//     }
//   }, [value, delay])

//   return debouncedValue
// }

import { useEffect, useState, useRef } from 'react'

interface DebounceOptions {
  skipInitial?: boolean;
  trigger?: any; // Changed type to allow any trigger value
}

export function useDebounce<T>(
  value: T, 
  delay: number,
  options: DebounceOptions = { 
    skipInitial: true
  }
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const initialRender = useRef(true)
  const previousTimeout = useRef<NodeJS.Timeout | null>(null)
  const previousValue = useRef<T>(value)

  useEffect(() => {
    // Skip initial run if needed
    if (options.skipInitial && initialRender.current) {
      initialRender.current = false
      return
    }

    // Only debounce if the value changed or trigger was provided
    if (JSON.stringify(value) === JSON.stringify(previousValue.current) && 
        options.trigger === undefined) {
      return
    }

    // Clear previous timeout
    if (previousTimeout.current) {
      clearTimeout(previousTimeout.current)
    }

    previousValue.current = value
    
    // Set new timeout
    previousTimeout.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (previousTimeout.current) {
        clearTimeout(previousTimeout.current)
      }
    }
  }, [value, delay, options.trigger, options.skipInitial])

  return debouncedValue
}