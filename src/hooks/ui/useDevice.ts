import React from "react"

const MOBILE_BREAKPOINT = 768

export function useDevice() {
    const [deviceInfo, setDeviceInfo] = React.useState({
      isMobile: false,
      isTouch: false,
      viewport: {
        width: 0,
        height: 0
      }
    })
  
    React.useEffect(() => {
      // Handle SSR
      if (typeof window === 'undefined') return
  
      function updateDeviceInfo() {
        const info = {
          // Screen size check
          isMobile: window.innerWidth < MOBILE_BREAKPOINT,
          
          // Touch capability check
          isTouch: 'ontouchstart' in window || 
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0,
            
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
  
        // Additional mobile indicators
        const mobileIndicators = {
          userAgent: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ),
          mediaQuery: window.matchMedia('(hover: none) and (pointer: coarse)').matches,
          orientation: 'orientation' in window
        }
  
        // Consider device as mobile if it meets multiple criteria
        info.isMobile = [
          info.isMobile,
          info.isTouch,
          mobileIndicators.userAgent,
          mobileIndicators.mediaQuery
        ].filter(Boolean).length >= 2
  
        setDeviceInfo(info)
      }
  
      // Initial check
      updateDeviceInfo()
  
      // Event listeners for changes
      const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const orientationQuery = window.matchMedia('(orientation: portrait)')
  
      const handleChange = () => updateDeviceInfo()
  
      mediaQuery.addEventListener('change', handleChange)
      orientationQuery.addEventListener('change', handleChange)
      window.addEventListener('resize', handleChange)
  
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
        orientationQuery.removeEventListener('change', handleChange)
        window.removeEventListener('resize', handleChange)
      }
    }, [])
  
    return deviceInfo
  }
  
  // Usage example:
  // const { isMobile, isTouch, viewport } = useDevice()