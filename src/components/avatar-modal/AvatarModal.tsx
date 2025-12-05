import { useState } from "react"

import Image from "next/image"

import { X } from "lucide-react"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ExpandableAvatarProps {
  imageUrl?: string
  firstName: string
  lastName: string
}

export function ExpandableAvatar({ imageUrl, firstName, lastName }: ExpandableAvatarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const toggleExpand = () => setIsExpanded(!isExpanded)

  return (
    <>
      <Avatar className="w-20 h-20 cursor-pointer" onClick={toggleExpand}>
        <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />
        <AvatarFallback className="bg-slate-500 text-white text-xl">
          {firstName.charAt(0)}
          {lastName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {isExpanded && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={toggleExpand}>
          <div className="relative bg-secondary  p-1.5 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={toggleExpand}
              className="absolute -top-2 -right-2 p-2 rounded-full bg-white text-gray-900 hover:bg-gray-100 z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-white rounded-full">
              <div className="relative w-64 h-64 rounded-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`${firstName} ${lastName}`}
                  fill
                  sizes="256px"
                  className="object-cover"
                  priority={true}
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}