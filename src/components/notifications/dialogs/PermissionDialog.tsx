// Archivo: components/notifications/dialogs/PermissionDialog.tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PermissionDialog({ open, onOpenChange, onConfirm }: PermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permitir notificaciones</DialogTitle>
          <DialogDescription>
            Para recibir notificaciones, necesitamos tu permiso.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            Aparecerá un diálogo del navegador solicitando permiso. Para continuar recibiendo notificaciones, selecciona Permitir.
          </p>
          <div className="mt-4 p-4 border rounded bg-muted/50">
            <p className="text-center text-sm">
              <strong>¡Importante!</strong> En algunos navegadores móviles, si rechazas este permiso, podría ser difícil activarlo nuevamente.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Solicitar permiso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}