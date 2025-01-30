import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/viajes',
    '/dashboard',
    '/perfil',
]);

const isProtectedAdminRoute = createRouteMatcher([
    '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // Restrict admin routes to users with specific permissions
    if (isProtectedAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
        console.log(
            'User tried to access admin route without permission',
            (await auth()).sessionClaims
        )
        const url = new URL('/', req.url)
        return NextResponse.redirect(url)
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