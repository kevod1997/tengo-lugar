// Archivo: components/notifications/dialogs/InstallAppDialog.tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface InstallAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallAppDialog({ open, onOpenChange }: InstallAppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instalar como aplicación</DialogTitle>
          <DialogDescription>
            Instala Tengo Lugar como una aplicación para una mejor experiencia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm">
            Al instalar nuestra aplicación web en tu dispositivo:
          </p>

          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Recibirás notificaciones de manera más confiable</li>
            <li>Tendrás acceso rápido desde tu pantalla de inicio</li>
            <li>Disfrutarás de una experiencia similar a una app nativa</li>
            <li>No ocupará espacio adicional en tu dispositivo</li>
          </ul>

          <div className="bg-muted p-3 rounded-md mt-2">
            <h4 className="font-medium">¿Cómo instalar?</h4>
            <p className="text-sm mt-1">
              En la mayoría de navegadores, busca la opción Añadir a pantalla de inicio o Instalar aplicación en el menú del navegador.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}