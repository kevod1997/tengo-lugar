'use client'

import { SidebarProvider } from '../ui/sidebar'
import React from 'react'
import QueryProvider from './QueryProvider'
import { useAuthSession } from '@/hooks/ui/useAuthSession'

interface Props {
    children: React.ReactNode
    initialSession?: any
}

export function Providers({ children, initialSession }: Props) {
    const [open, setOpen] = React.useState(false)
    
    // ✅ Toda la lógica de auth en el hook
    useAuthSession(initialSession)

    return (
        <QueryProvider>
            <SidebarProvider open={open} onOpenChange={setOpen}>
                {children}
            </SidebarProvider>
        </QueryProvider>
    )
}