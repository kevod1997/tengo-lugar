'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Header from '@/components/header/header';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Chat room error:', error);
  }, [error]);

  return (
    <>
      <Header 
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mensajes', href: '/mensajes' },
          { label: 'Error' },
        ]} 
      />
      
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
          <p className="text-muted-foreground mb-4">
            Ocurrió un error al cargar el chat. Por favor, intenta de nuevo.
          </p>
          <Button onClick={reset}>Intentar de nuevo</Button>
        </div>
      </div>
    </>
  );
}