// Archivo: components/notifications/dialogs/SystemPermissionsDialog.tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface SystemPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowInstallOptions: () => void;
}

export function SystemPermissionsDialog({ 
  open, 
  onOpenChange, 
  onShowInstallOptions 
}: SystemPermissionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Habilitar notificaciones del sistema</DialogTitle>
          <DialogDescription>
            El navegador requiere permisos adicionales para mostrar notificaciones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm">
            Aunque has permitido las notificaciones web, tu navegador no puede mostrarlas porque las
            notificaciones del sistema están desactivadas para Chrome.
          </p>

          <div className="space-y-2">
            <h4 className="font-medium">Sigue estos pasos:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Abre la aplicación <strong>Configuración</strong> de tu dispositivo</li>
              <li>Busca la sección <strong>Aplicaciones</strong> o <strong>Administrador de aplicaciones</strong></li>
              <li>Encuentra y selecciona el navegador <strong>Chrome</strong> (o el que estés usando)</li>
              <li>Toca <strong>Notificaciones</strong></li>
              <li>Activa <strong>Permitir notificaciones</strong></li>
              <li>Vuelve a esta página y reinicia el proceso</li>
            </ol>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-md dark:bg-blue-950">
            <h4 className="font-medium">Otra alternativa:</h4>
            <p className="text-sm mt-1">
              Puedes instalar nuestra aplicación para recibir notificaciones de manera más confiable.
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Lo intentaré después
          </Button>
          <Button onClick={onShowInstallOptions}>
            Ver opciones de instalación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}