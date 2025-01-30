import { useRef, useState } from 'react'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async (): Promise<void> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const stopCamera = (): void => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = async (fileName: string): Promise<File | null> => {
    if (!videoRef.current) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)

    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(new File([blob], fileName, { type: 'image/jpeg' }))
        } else {
          resolve(null)
        }
      }, 'image/jpeg')
    })
  }

  return {
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
  }
}