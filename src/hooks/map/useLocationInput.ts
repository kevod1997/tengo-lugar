import { useState, useEffect, useRef } from 'react'
import { useGeocodingService } from '@/hooks/map/useGeocodingService'
import { Coordinates, LocationInfo } from '@/types/route-types'

interface UseLocationInputProps {
  initialValue: string
  isGoogleMapsLoaded: boolean
  elementId: string
}

export function useLocationInput({
  initialValue,
  isGoogleMapsLoaded,
  elementId
}: UseLocationInputProps) {
  const [value, setValue] = useState(initialValue)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    address: '',
    city: '',
    province: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { geocodeAddress } = useGeocodingService(isGoogleMapsLoaded)
  
  // Use ref to track current value for events
  const valueRef = useRef(value)
  
  // Update ref when value changes
  useEffect(() => {
    valueRef.current = value
  }, [value])
  
  // Initialize Google Places Autocomplete when Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded) return
    
    const inputElement = document.getElementById(elementId) as HTMLInputElement
    if (!inputElement) return
    
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      fields: ['geometry', 'formatted_address', 'address_components', 'place_id'],
      componentRestrictions: {country: 'ar'}
    })
    
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place?.geometry?.location) {
        setValue(place.formatted_address || valueRef.current)
        setCoordinates({
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        })
        
        // Extract location info from address components
        extractLocationInfo(place.address_components)
      }
    })
    
    return () => {
      if (listener) google.maps.event.removeListener(listener)
    }
  }, [isGoogleMapsLoaded, elementId])
  
  // Extract location info from address components
  const extractLocationInfo = (addressComponents?: google.maps.GeocoderAddressComponent[]) => {
    if (!addressComponents) return
    
    let address = ''
    let city = ''
    let province = ''
    
    for (const component of addressComponents) {
      const componentType = component.types[0]
      
      // For address
      if (componentType === 'street_number') {
        address = component.long_name + ' ' + address
      }
      
      if (componentType === 'route') {
        address = address ? address + ' ' + component.long_name : component.long_name
      }
      
      // For city
      if (componentType === 'locality') {
        city = component.long_name
      }
      
      // For province
      if (componentType === 'administrative_area_level_1') {
        province = component.long_name
      }
    }
    
    setLocationInfo({
      address,
      city,
      province
    })
  }
  
  // Ensure coordinates are available, geocode if needed
  const ensureCoordinates = async (): Promise<boolean> => {
    if (coordinates) return true
    
    if (!value) return false
    
    setIsLoading(true)
    
    try {
      const result = await geocodeAddress(value)
      if (!result) return false
      
      setCoordinates(result.coordinates)
      setLocationInfo(result.locationInfo)
      return true
    } catch (error) {
      console.error('Error geocoding address:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    value,
    coordinates,
    locationInfo,
    isLoading,
    setValue,
    ensureCoordinates,
    elementId,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)
  }
}