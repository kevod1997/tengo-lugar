'use client'

import { SidebarProvider } from '../ui/sidebar';
import React from 'react';
import QueryProvider from './QueryProvider';
// import { AuthProvider } from './AuthProvider';

interface Props {
    children: React.ReactNode;
}

export const Providers = ({ children }: Props) => {
    const [open, setOpen] = React.useState(false)

    return (
        // <AuthProvider>
            <QueryProvider>
                <SidebarProvider open={open} onOpenChange={setOpen}>
                    {children}
                </SidebarProvider>
            </QueryProvider>
        // </AuthProvider>
    );
};