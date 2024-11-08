'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, SwitchCamera, X, Upload } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { cn } from "@/lib/utils"

interface ImageCaptureProps {
  onCapture: (file: File, preview: string) => void
  onError: (error: string) => void
  aspectRatio?: number
  id: string
}

export function ImageCapture({ onCapture, onError, aspectRatio = 1.6, id }: ImageCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [captureMethod, setCaptureMethod] = useState<'upload' | 'camera'>('upload')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = newStream
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      onError('No se pudo acceder a la cámara. Por favor, verifique los permisos e intente nuevamente.')
      setCaptureMethod('upload')
    }
  }, [facingMode, onError])

  useEffect(() => {
    if (isOpen && captureMethod === 'camera') {
      startCamera()
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [isOpen, captureMethod, startCamera])

  const handleClose = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsOpen(false)
    setImageSrc(null)
    setCaptureMethod('upload')
  }, [])

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string)
        setIsOpen(true)
        setCaptureMethod('upload')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }
        
        ctx.drawImage(videoRef.current, 0, 0)
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setImageSrc(dataUrl)
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
    }
  }, [facingMode])

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const finalizeCrop = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return
  
      const canvas = document.createElement('canvas')
      const image = await createImage(imageSrc)
      
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
  
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      )
  
      // Get the preview first
      const preview = canvas.toDataURL('image/jpeg', 0.8)
  
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `${id}-${Date.now()}.jpg`, { type: 'image/jpeg' })
            onCapture(file, preview) // Pass both file and preview
            handleClose()
          }
        },
        'image/jpeg',
        0.8
      )
    } catch (e) {
      console.error('Error finalizing crop:', e)
      onError('Error al procesar la imagen. Por favor, intente nuevamente.')
    }
  }, [imageSrc, croppedAreaPixels, id, onCapture, handleClose, onError])

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm">Subir archivo</span>
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => {
            setIsOpen(true)
            setCaptureMethod('camera')
          }}
        >
          <Camera className="h-6 w-6" />
          <span className="text-sm">Usar cámara</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px] p-0">
          <DialogHeader className="p-6">
            <DialogTitle>
              {imageSrc ? 'Recortar Imagen' : 'Capturar Imagen'}
            </DialogTitle>
          </DialogHeader>
          {captureMethod === 'camera' && !imageSrc ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(console.error)
                  }
                }}
                className={cn(
                  "w-full h-[600px] object-cover bg-black",
                  facingMode === 'user' && "scale-x-[-1]"
                )}
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/10 border-white/20 hover:bg-white/20"
                    onClick={toggleCamera}
                  >
                    <SwitchCamera className="h-5 w-5 text-white" />
                  </Button>
                  
                  <Button
                    className="flex-1 rounded-full"
                    onClick={captureImage}
                  >
                    Capturar
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/10 border-white/20 hover:bg-white/20"
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5 text-white"/>
                  </Button>
                </div>
              </div>
            </div>
          ) : imageSrc ? (
            <div className="relative h-[600px]">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="rect"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    onClick={() => {
                      setImageSrc(null)
                      if (captureMethod === 'camera') {
                        startCamera()
                      } else {
                        handleClose()
                      }
                    }}
                  >
                    {captureMethod === 'camera' ? 'Volver a capturar' : 'Cancelar'}
                  </Button>
                  <Button
                    className="flex-1 rounded-full"
                    onClick={finalizeCrop}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })