import { useCallback, useEffect, useRef } from "react"

export function useScrollToTop() {
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const scrollToTop = useCallback(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0
        }
        if (contentRef.current) {
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(scrollToTop, 100)
        return () => clearTimeout(timeoutId)
    }, [scrollToTop])

    return {
        scrollAreaRef,
        contentRef,
        scrollToTop
    }
}