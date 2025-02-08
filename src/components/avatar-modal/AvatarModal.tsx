import { useState } from "react"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"

interface ExpandableAvatarProps {
    imageUrl?: string
    firstName: string
    lastName: string
}

export function ExpandableAvatar({ imageUrl, firstName, lastName }: ExpandableAvatarProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    //todo acomodar el componenete img
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative max-w-2xl w-full mx-4">
                        <button
                            onClick={toggleExpand}
                            className="absolute -top-2 -right-2 p-2 rounded-full bg-white text-gray-900 hover:bg-gray-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="bg-white p-2 rounded-lg">
                            <div className="aspect-square w-full overflow-hidden rounded-lg">
                                <img
                                    src={imageUrl || "/placeholder.svg"}
                                    alt="Profile picture"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}