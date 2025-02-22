'use client'

import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import { SidebarProvider } from '../ui/sidebar';
import React from 'react';
import QueryProvider from './Query-Provider';


interface Props {
    children: React.ReactNode;
}

export const Providers = ({ children }: Props) => {
    const [open, setOpen] = React.useState(false)

    return (
        <ClerkProvider localization={esES}>
            <QueryProvider>
                <SidebarProvider open={open} onOpenChange={setOpen}>
                    {children}
                </SidebarProvider>
            </QueryProvider>
        </ClerkProvider>
    );
};