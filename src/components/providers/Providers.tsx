'use client'

import { SidebarProvider } from '../ui/sidebar';
import React from 'react';
import QueryProvider from './QueryProvider';
import { useEffect, useRef } from 'react'
import { getUserById } from "@/actions"
import { useLoadingStore } from "@/store/loadingStore"
import { useUserStore } from "@/store/user-store"
import { useRouter } from 'next/navigation';
import { AuthLoadingDetector } from '../AuthLoadingDetector';

interface Props {
    children: React.ReactNode;
    initialSession?: any;
}

export function Providers({ children, initialSession }: Props) {
    const [open, setOpen] = React.useState(false)
    const { user, setUser } = useUserStore()
    const { stopLoading, isLoading } = useLoadingStore()
    const router = useRouter()
    const isLoadingUser = useRef(false)

    useEffect(() => {
        const sessionExists = !!initialSession?.user?.id
        const hasUserInStore = !!user
        const isLoggingOut = isLoading('signingOut')
        const isAuthLoading = isLoading('authRedirect')

        if (isLoggingOut) return

        // ✅ Cargar usuario si hay session y authLoading está activo
        if (sessionExists && !hasUserInStore && !isLoadingUser.current && isAuthLoading) {
            isLoadingUser.current = true

            getUserById(initialSession.user.id)
                .then(userData => {
                    if (userData) {
                        setUser(userData)
                    }
                })
                .catch(console.error)
                .finally(() => {
                    isLoadingUser.current = false
                    // ✅ Detener loading y limpiar URL
                    stopLoading('authRedirect')

                    // ✅ Limpiar parámetro de URL
                    const currentUrl = new URL(window.location.href)
                    if (currentUrl.searchParams.has('_authLoading')) {
                        currentUrl.searchParams.delete('_authLoading')
                        router.replace(currentUrl.pathname + currentUrl.search, { scroll: false })
                    }
                })
        }

    }, [initialSession?.user?.id, !!user, isLoading('signingOut'), isLoading('authRedirect')])

    return (
        <QueryProvider>
            <SidebarProvider open={open} onOpenChange={setOpen}>
                <AuthLoadingDetector />
                {children}
            </SidebarProvider>
        </QueryProvider>
    );
};