import { Loader2 } from "lucide-react"

interface HydrationLoadingProps {
    /**
     * Custom message to display during loading
     */
    message?: string

    /**
     * Size of the spinner (small, medium, large)
     */
    size?: 'sm' | 'md' | 'lg'

    /**
     * Optional className for the container
     */
    className?: string
}

/**
 * Component to show while waiting for hydration
 */
export function HydrationLoading({
    message = "Cargando...",
    size = 'md',
    className = ''
}: HydrationLoadingProps) {
    const sizeMap = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    }

    return (
        <div className={`w-full flex justify-center items-center ${className}`}>
            <div className="flex flex-col items-center">
                <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
                {message && <p className="mt-4 text-muted-foreground">{message}</p>}
            </div>
        </div>
    )
}