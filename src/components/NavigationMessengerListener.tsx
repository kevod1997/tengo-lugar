'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function NavigationMessageListener() {
  const router = useRouter();
  
  useEffect(() => {
    const handleNavigationMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE') {
        console.log('Received navigation message:', event.data.url);
        // Usar el router de Next.js para navegar sin refresh
        router.push(event.data.url);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleNavigationMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleNavigationMessage);
    };
  }, [router]);
  
  return null; // Este componente no renderiza nada
}