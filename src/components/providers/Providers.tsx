'use client'

import { SidebarProvider } from '../ui/sidebar'
import React from 'react'
import QueryProvider from './QueryProvider'
import { AuthSessionProvider } from './AuthSessionProvider'

interface Props {
    children: React.ReactNode
    initialSession?: any
}

export function Providers({ children, initialSession }: Props) {
    const [open, setOpen] = React.useState(false)

    return (
        <QueryProvider>
            <AuthSessionProvider initialSession={initialSession}>
                <SidebarProvider open={open} onOpenChange={setOpen}>
                    {children}
                </SidebarProvider>
            </AuthSessionProvider>
        </QueryProvider>
    )
}