export function getGoogleMapsUrl(origin: string, destination: string): string {
    if (!origin || !destination) return '';
  
    let url = 'https://www.google.com/maps/dir/?api=1';
    url += `&origin=${encodeURIComponent(origin)}`;
    url += `&destination=${encodeURIComponent(destination)}`;
    url += '&travelmode=driving';
  
    return url;
  }