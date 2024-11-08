import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { getUserByClerkId } from './actions/user';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/viajes',
    '/dashboard',
    '/perfil',
]);

const isProtectedAdminRoute = createRouteMatcher([
    '/admin',
]);

export default clerkMiddleware(async (auth, req) => {
    // Restrict admin routes to users with specific permissions
    if (isProtectedAdminRoute(req)) {
        await auth.protect((has) => {
            return (
                has({ permission: 'org:sys_memberships:manage' }) ||
                has({ permission: 'org:sys_domains_manage' })
            )
        })
    }
    // Restrict organization routes to signed in users
    if (isProtectedRoute(req)) await auth.protect()
        
})


export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}