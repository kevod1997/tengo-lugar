import { useState } from 'react';
import { toast } from 'sonner';
import { Coordinates, LocationInfo } from '@/types/route-types';

export function useGeocodingService(isGoogleMapsLoaded: boolean) {
  const [isGeocoding, setIsGeocoding] = useState(false);

  const geocodeAddress = async (
    addressToGeocode: string
  ): Promise<{ coordinates: Coordinates; locationInfo: LocationInfo } | null> => {
    if (!isGoogleMapsLoaded) {
      toast.error('Google Maps aún no ha terminado de cargar');
      return null;
    }

    setIsGeocoding(true);
    
    try {
      const geocoder = new google.maps.Geocoder();
      
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: addressToGeocode }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (!result[0]?.geometry?.location) {
        toast.error('No se pudo encontrar las coordenadas de la dirección');
        return null;
      }

      const coordinates: Coordinates = {
        latitude: result[0].geometry.location.lat(),
        longitude: result[0].geometry.location.lng(),
      };

      // Extraer información de ubicación
      let address = '';
      let city = '';
      let province = '';

      if (result[0].address_components) {
        for (const component of result[0].address_components) {
          const componentType = component.types[0];

          // Para dirección
          let number = '';
          let street = '';

          if (componentType === 'street_number') {
            number = component.long_name;
          }

          if (componentType === 'route') {
            street = component.long_name;
          }

          address = street + ' ' + number;

          // Para ciudad
          if (componentType === 'locality') {
            city = component.long_name;
          }

          // Para provincia
          if (componentType === 'administrative_area_level_1') {
            province = component.long_name;
          }
        }
      }

      return {
        coordinates,
        locationInfo: {
          address,
          city,
          province,
        },
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Error al geocodificar la dirección');
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  return {
    geocodeAddress,
    isGeocoding,
  };
}