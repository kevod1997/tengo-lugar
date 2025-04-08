import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Square } from 'lucide-react'

interface UnsupportedBrowserCardProps {
  error: string | null;
  iosVersion?: string;
  onShowInstallInstructions: () => void;
}

export function UnsupportedBrowserCard({ 
  error, 
  iosVersion, 
  onShowInstallInstructions 
}: UnsupportedBrowserCardProps) {
  // Add custom handling for iOS
  const isIOSInstallNeeded = error === 'NEEDS_PWA_INSTALL';
  const isIOSUnsupported = error === 'UNSUPPORTED_IOS';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones Push</CardTitle>
        <CardDescription>
          {isIOSInstallNeeded 
            ? "Para recibir notificaciones en iOS, necesitas instalar la aplicación en tu pantalla de inicio."
            : "Tu navegador no soporta notificaciones push."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isIOSInstallNeeded && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-amber-500">
              <Info className="h-5 w-5 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Dispositivo iOS detectado</p>
                <p className="text-sm">Las notificaciones push en iOS solo funcionan cuando la aplicación está instalada como PWA.</p>
              </div>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <h4 className="text-sm font-medium">Cómo instalar la aplicación:</h4>
              <ol className="mt-2 list-decimal pl-5 text-sm space-y-1">
                <li>Toca el botón <span className="inline-flex items-center"><Square className="h-3 w-3 mr-1" />compartir</span> en la barra de navegación</li>
                <li>Desplázate y selecciona Añadir a pantalla de inicio</li>
                <li>Confirma tocando Añadir</li>
                <li>Usa la aplicación desde tu pantalla de inicio para recibir notificaciones</li>
              </ol>
            </div>
          </div>
        )}
        
        {isIOSUnsupported && (
          <div className="flex items-start gap-2 text-amber-500">
            <Info className="h-5 w-5 mt-0.5" />
            <div>
              <p className="text-sm font-medium">iOS {iosVersion} no soporta notificaciones push</p>
              <p className="text-sm">Las notificaciones push requieren iOS 16.4 o superior. Por favor, actualiza tu dispositivo.</p>
            </div>
          </div>
        )}
        
        {!isIOSInstallNeeded && !isIOSUnsupported && error && (
          <div className="flex items-start gap-2 text-amber-500">
            <Info className="h-5 w-5 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
      
      {isIOSInstallNeeded && (
        <CardFooter>
          <Button className="w-full" onClick={onShowInstallInstructions}>
            Ver instrucciones detalladas
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}