'use client'

import React, { useState, useRef } from 'react'

import Image from 'next/image'

import { Upload, X, FileIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"


interface DocumentUploadProps {
  onCapture: (file: File, preview: string) => void
  id: string
  accept: string
  maxSize: number 
  title?: string
}

export function DocumentUpload({ 
  onCapture, 
  id,
  accept,
  maxSize,
  title = "Subir archivo"
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Validar tamaño
    if (selectedFile.size > maxSize) {
      toast.error(`El archivo no debe superar ${maxSize}MB`, {
        description: 'Por favor, selecciona un archivo más pequeño'
      })
      return
    }

    // Validar tipo
    if (!accept.includes(selectedFile.type)) {
      toast.error('Formato de archivo no permitido', {
        description: 'Solo se permiten archivos PDF o imágenes'
      })
      return
    }

    try {
      if (selectedFile.type === 'application/pdf') {
        setPreview('/pdf-icon.png')
      } else {
        const previewUrl = URL.createObjectURL(selectedFile)
        setPreview(previewUrl)
      }

      setFile(selectedFile)
      onCapture(selectedFile, selectedFile.type === 'application/pdf' ? '/pdf-icon.png' : URL.createObjectURL(selectedFile))
    } catch (error) {
      toast.error('Error al procesar el archivo', {
        description: 'Ocurrió un error inesperado. Intenta nuevamente.'
      })
      console.error('Error processing file:', error)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id={id}
      />

      {!file ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm">{title}</span>
        </Button>
      ) : (
        <div className="relative rounded-lg border p-4">
          <div className="flex items-center gap-4">
            {file.type === 'application/pdf' ? (
              <FileIcon className="h-8 w-8" />
            ) : (
              preview &&
              //  <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded" />
              <Image src={preview} alt="Preview" width={20} height={20} className="rounded" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}