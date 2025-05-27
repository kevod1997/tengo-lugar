import { useState, useEffect } from 'react'

interface UseSearchLocationInputProps {
  initialValue?: string
  isGoogleMapsLoaded: boolean
  elementId: string
}

export function useSearchLocationInput({
  initialValue = '',
  isGoogleMapsLoaded,
  elementId
}: UseSearchLocationInputProps) {
  const [value, setValue] = useState(initialValue)
  const [cityName, setCityName] = useState<string>(initialValue)
  
  useEffect(() => {
    if (!isGoogleMapsLoaded) return
    
    const inputElement = document.getElementById(elementId) as HTMLInputElement
    if (!inputElement) return
    
    // Configurar autocompletado solo para ciudades argentinas
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      componentRestrictions: { country: 'ar' },
      types: ['(cities)'], // Solo ciudades
      fields: ['address_components', 'name'] // Solo necesitamos el nombre
    })
    
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      
      if (place?.address_components) {
        // Buscar el nombre de la ciudad en los componentes
        let city = ''
        
        for (const component of place.address_components) {
          if (component.types.includes('locality')) {
            city = component.long_name
            break
          }
        }
        
        // Si no encontramos locality, usar el nombre del lugar
        const finalCityName = city || place.name || ''
        
        setValue(finalCityName)
        setCityName(finalCityName)
      }
    })
    
    return () => {
      if (listener) google.maps.event.removeListener(listener)
    }
  }, [isGoogleMapsLoaded, elementId])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    // Solo actualizar cityName si el usuario borra el campo
    if (!newValue) {
      setCityName('')
    }
  }
  
  return {
    value,
    cityName, // El nombre de ciudad confirmado para búsqueda
    handleChange,
    setValue,
    setCityName
  }
}