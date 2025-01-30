import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
  interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    cancelText?: string
    confirmText?: string
    onConfirm: () => void
    onCancel?: () => void
  }
  
  export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelText = "Cancelar",
    confirmText = "Confirmar",
    onConfirm,
    onCancel,
  }: ConfirmationDialogProps) {
    const handleCancel = () => {
      onCancel?.()
      onOpenChange(false)
    }
  
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }