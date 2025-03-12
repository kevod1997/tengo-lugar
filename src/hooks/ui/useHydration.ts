import { useState, useEffect } from 'react'

interface UseHydrationOptions {
  /**
   * Time in milliseconds to wait for hydration
   */
  delay?: number
  
  /**
   * Optional callback to determine when hydration is complete
   * Useful when you need to check if specific data is loaded
   */
  isHydratedFn?: () => boolean
}

/**
 * Hook to handle hydration state in client components that use global state
 */
export function useHydration({ 
  delay = 500,
  isHydratedFn
}: UseHydrationOptions = {}) {
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    // If a custom hydration check function is provided, use it
    if (isHydratedFn) {
      if (isHydratedFn()) {
        setIsHydrated(true)
      } else {
        // Check periodically until hydrated
        const interval = setInterval(() => {
          if (isHydratedFn()) {
            setIsHydrated(true)
            clearInterval(interval)
          }
        }, 100)
        
        return () => clearInterval(interval)
      }
    } else {
      // Otherwise, just use a delay
      const timer = setTimeout(() => {
        setIsHydrated(true)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [delay, isHydratedFn])
  
  return { isHydrated }
}