import { useCallback, useState } from "react"

export function useDialog(onClose?: () => void) {
    const [isOpen, setIsOpen] = useState(true)
    const [showConfirmation, setShowConfirmation] = useState(false)
  
    const handleClose = useCallback(() => {
      setIsOpen(false)
      onClose?.()
    }, [onClose])
  
    const handleCloseAttempt = useCallback((shouldConfirm: boolean) => {
      if (shouldConfirm) {
        setShowConfirmation(true)
      } else {
        handleClose()
      }
    }, [handleClose])

    //handle confirm exit queda pendienete de implementar
  
    return {
      isOpen,
      showConfirmation,
      setShowConfirmation,
      handleClose,
      handleCloseAttempt
    }
  }