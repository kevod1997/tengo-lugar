'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Progress } from './ui/progress'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  useEffect(() => {
    if (isNavigating) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + Math.random() * 10, 90)
          if (newProgress === 90) {
            clearInterval(interval)
          }
          return newProgress
        })
      }, 200)

      return () => clearInterval(interval)
    } else {
      setProgress(100)
      const timer = setTimeout(() => setProgress(0), 500)
      return () => clearTimeout(timer)
    }
  }, [isNavigating])

  if (progress === 0) return null

  return (
    <Progress
      value={progress}
      className="fixed top-0 left-0 right-0 z-50 h-1 w-full bg-transparent"
    />
  )
}