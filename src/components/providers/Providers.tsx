'use client'

import React from 'react'

import { AuthSessionProvider } from './AuthSessionProvider'
import QueryProvider from './QueryProvider'
import { WebSocketProvider } from './WebSocketProvider'
import { SidebarProvider } from '../ui/sidebar'

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