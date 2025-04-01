// hooks/ui/useGoogleMapsScripts.ts
import { useState, useEffect } from 'react'

// Keep track of script loading status globally
let isLoading = false
let isLoaded = false
let callbacks: Array<() => void> = []

interface UseGoogleMapsScriptOptions {
  apiKey: string
  libraries?: string[]
}

export function useGoogleMapsScript({ 
  apiKey, 
  libraries = ['places'] 
}: UseGoogleMapsScriptOptions) {
  const [scriptLoaded, setScriptLoaded] = useState(isLoaded)

  useEffect(() => {
    // If already loaded, update state and return
    if (isLoaded) {
      setScriptLoaded(true)
      return
    }

    // Register callback to be called when script loads
    callbacks.push(() => setScriptLoaded(true))

    // If already loading, just wait for the callbacks
    if (isLoading) {
      return
    }

    // Set loading flag
    isLoading = true

    // Check if script already exists
    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      return // Script tag already exists
    }

    // Create the script element
    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&loading=async&callback=initMap`
    script.async = true
    script.defer = true

    // Define global callback that will run when Google Maps is loaded
    window.initMap = function() {
      isLoaded = true
      isLoading = false
      
      // Call all registered callbacks
      callbacks.forEach(callback => callback())
      callbacks = []
    }

    // Add script to document
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Remove this component's callback
      callbacks = callbacks.filter(callback => callback !== setScriptLoaded)
      
      // We don't remove the script element to avoid reloading it for other components
    }
  }, [apiKey, libraries])

  return { isLoaded: scriptLoaded }
}

// Add this for TypeScript
declare global {
  interface Window {
    initMap: () => void;
  }
}