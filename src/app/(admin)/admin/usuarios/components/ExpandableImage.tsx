import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface ExpandableImageProps {
  src: string
  alt: string
}

export function ExpandableImage({ src, alt }: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <div 
        className="cursor-pointer" 
        onClick={() => setIsExpanded(true)}
        role="button"
        aria-label={`Expandir imagen de ${alt}`}
      >
        <Image src={src} alt={alt} width={300} height={200} className="object-cover md:opacity-85 rounded-lg hover:opacity-100 " />
      </div>
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
      <DialogTitle className="sr-only">Sheet</DialogTitle>
        <DialogContent className="max-w-4xl">
          <Image src={src} alt={alt} width={1200} height={800} className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </>
  )
}

