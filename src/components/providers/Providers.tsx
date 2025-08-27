'use client'

import { SidebarProvider } from '../ui/sidebar'
import React from 'react'
import QueryProvider from './QueryProvider'
import { AuthSessionProvider } from './AuthSessionProvider'
import { WebSocketProvider } from './WebSocketProvider'

interface Props {
    children: React.ReactNode
    initialSession?: any
}

export function Providers({ children, initialSession }: Props) {
    const [open, setOpen] = React.useState(false)

    return (
        <QueryProvider>
            <AuthSessionProvider initialSession={initialSession}>
                <WebSocketProvider>
                    <SidebarProvider open={open} onOpenChange={setOpen}>
                        {children}
                    </SidebarProvider>
                </WebSocketProvider>
            </AuthSessionProvider>
        </QueryProvider>
    )
}