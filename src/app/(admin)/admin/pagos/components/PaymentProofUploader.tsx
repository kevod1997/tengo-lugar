'use client'

import { useState, useCallback } from 'react'

import Image from 'next/image'

import { Upload, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

import { uploadPaymentProof } from '@/actions/payment/upload-payment-proof'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'


interface PaymentProofUploaderProps {
  paymentId: string
  onUploadSuccess: (fileKey: string) => void
  onError?: (error: string) => void
  disabled?: boolean
}

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function PaymentProofUploader({
  paymentId,
  onUploadSuccess,
  onError,
  disabled = false,
}: PaymentProofUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    type: string
    preview?: string
  } | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || uploading) return

      const file = acceptedFiles[0]
      if (!file) return

      // Client-side validations
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = 'El archivo no debe superar 5MB'
        toast.error(errorMsg)
        onError?.(errorMsg)
        return
      }

      if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
        const errorMsg = 'Formato no válido. Solo JPG, PNG o PDF'
        toast.error(errorMsg)
        onError?.(errorMsg)
        return
      }

      try {
        setUploading(true)

        // Generate preview for images (base64)
        let preview: string | undefined
        if (file.type.startsWith('image/')) {
          preview = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        }

        // Send to Server Action (uses uploadDocuments internally)
        const response = await uploadPaymentProof({
          paymentId,
          file,
          preview,
        })

        if (!response.success) {
          throw new Error(response.message || 'Error subiendo el comprobante')
        }

        // Type guard to ensure response.data and fileKey exist
        if (!response.data?.fileKey) {
          throw new Error('No se recibió la clave del archivo del servidor')
        }

        // Set uploaded file for UI
        setUploadedFile({
          name: file.name,
          type: file.type,
          preview: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        })

        // Call success callback with validated file key
        onUploadSuccess(response.data.fileKey)

        toast.success('Comprobante cargado exitosamente')
      } catch (err: any) {
        const errorMsg = err.message || 'Error subiendo el comprobante'
        toast.error(errorMsg)
        onError?.(errorMsg)
        console.error('Error uploading payment proof:', err)
      } finally {
        setUploading(false)
      }
    },
    [paymentId, onUploadSuccess, onError, disabled, uploading]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: disabled || uploading || !!uploadedFile,
  })

  const handleRemove = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview)
    }
    setUploadedFile(null)
    onUploadSuccess('') // Clear file key
  }

  if (uploadedFile) {
    return (
      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          {uploadedFile.type === 'application/pdf' ? (
            <FileText className="h-10 w-10 text-red-600 flex-shrink-0" />
          ) : uploadedFile.preview ? (
            <Image
              src={uploadedFile.preview}
              alt="Preview"
              width={80}
              height={80}
              className="h-20 w-20 object-cover rounded flex-shrink-0"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-blue-600 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Comprobante cargado exitosamente
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive && 'border-primary bg-primary/5',
        uploading && 'opacity-50 cursor-not-allowed',
        disabled && 'opacity-50 cursor-not-allowed',
        !isDragActive && !uploading && !disabled && 'hover:border-primary hover:bg-muted/50'
      )}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <div>
            <p className="text-sm font-medium">Subiendo comprobante...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Por favor espera
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Suelta el archivo aquí'
                : 'Arrastra el comprobante o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG o PDF • Máximo 5MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
