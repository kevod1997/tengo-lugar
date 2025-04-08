// Archivo: components/notifications/dialogs/ExplanationDialog.tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface ExplanationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
}

export function ExplanationDialog({ open, onOpenChange, onProceed }: ExplanationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sobre las notificaciones push</DialogTitle>
          <DialogDescription>
            Las notificaciones push te permiten recibir alertas importantes incluso cuando no estás usando la aplicación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <h4 className="font-medium">¿Para qué se utilizan?</h4>
            <p className="text-sm text-muted-foreground">
              Te enviaremos notificaciones sobre:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Actualizaciones sobre tus viajes</li>
              <li>Nuevas reservas o solicitudes</li>
              <li>Recordatorios importantes</li>
              <li>Promociones y ofertas especiales</li>
            </ul>
          </div>
          <div className="flex flex-col space-y-2">
            <h4 className="font-medium">¿Cómo funcionan en dispositivos móviles?</h4>
            <p className="text-sm text-muted-foreground">
              En tu dispositivo móvil, aparecerá una solicitud de permiso del navegador.
              Debes seleccionar Permitir para recibir notificaciones.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onProceed}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}