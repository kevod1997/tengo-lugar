// app/api/auth-redirect/route.ts - VERSIÓN OPTIMAL PARA UX
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { VerificationStatus } from '@prisma/client'

import { getUserById } from '@/actions'
import { auth } from '@/lib/auth'
import { LoggingService } from '@/services/logging/logging-service'
import { TipoAccionUsuario } from '@/types/actions-logs'

// export async function GET(request: NextRequest) {
//     const session = await auth.api.getSession({
//         headers: request.headers
//     })

//     if (!session) {
//         redirect('/login')
//     }

//     const searchParams = request.nextUrl.searchParams
//     const redirectUrl = searchParams.get('redirect_url')
//     let finalRedirectUrl = '/'

//     try {
//         // ✅ UNA SOLA LLAMADA - pero en servidor para UX óptima
//         const dbUser = await getUserById(session.user.id)

//         if (dbUser) {
//             // ✅ Logging inmediato
//             const isNewUser = new Date().getTime() - new Date(dbUser.createdAt).getTime() < 60000

//             await LoggingService.logActionWithErrorHandling({
//                 userId: session.user.id,
//                 action: isNewUser ? TipoAccionUsuario.REGISTRO_USUARIO : TipoAccionUsuario.INICIO_SESION,
//                 status: 'SUCCESS',
//             }, {
//                 fileName: 'auth-redirect/route.ts',
//                 functionName: 'GET'
//             })

//             // ✅ Redirección inteligente inmediata
//             const needsVerification =
//                 dbUser.identityStatus === VerificationStatus.FAILED ||
//                 dbUser.licenseStatus === VerificationStatus.FAILED ||
//                 dbUser.cars.some(car => car.insurance.status === VerificationStatus.FAILED)

//             if (needsVerification || !dbUser.hasBirthDate) {
//                 finalRedirectUrl = '/perfil'
//             } else {
//                 finalRedirectUrl = redirectUrl && isValidUrl(redirectUrl) ? redirectUrl : '/'
//             }
//         }



//     } catch (error) {
//         //capturar el error
//         console.error('Auth redirect error:', error)
//         const loginUrl = new URL('/login', request.url)
//         loginUrl.searchParams.set('error', 'auth_failed')
//         if (redirectUrl) {
//             loginUrl.searchParams.set('redirect_url', redirectUrl)
//         }
//         redirect(loginUrl.toString())
//     }

//     // ✅ REDIRECCIÓN DIRECTA - sin parámetros de loading
//     redirect(finalRedirectUrl)
// }

// function isValidUrl(url: string): boolean {
//     if (url.startsWith('/')) return true
//     try {
//         const urlObj = new URL(url)
//         return urlObj.hostname === process.env.NEXT_PUBLIC_CLIENT_URL
//     } catch {
//         return false
//     }
// }

// app/api/auth-redirect/route.ts
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session) {
        redirect('/login')
    }

    const searchParams = request.nextUrl.searchParams
    const redirectUrl = searchParams.get('redirect_url')
    let finalRedirectUrl = '/'

    try {
        const dbUser = await getUserById(session.user.id)

        if (dbUser) {
            // ✅ Logging y lógica de negocio
            const isNewUser = new Date().getTime() - new Date(dbUser.createdAt).getTime() < 60000

            await LoggingService.logActionWithErrorHandling({
                userId: session.user.id,
                action: isNewUser ? TipoAccionUsuario.REGISTRO_USUARIO : TipoAccionUsuario.INICIO_SESION,
                status: 'SUCCESS',
            }, {
                fileName: 'auth-redirect/route.ts',
                functionName: 'GET'
            })

            // ✅ Determinar redirección
            const needsVerification =
                dbUser.identityStatus === VerificationStatus.FAILED ||
                dbUser.licenseStatus === VerificationStatus.FAILED ||
                dbUser.cars.some(car => car.insurance.status === VerificationStatus.FAILED)

            if (needsVerification || !dbUser.hasBirthDate) {
                finalRedirectUrl = '/perfil'
            } else {
                finalRedirectUrl = redirectUrl && isValidUrl(redirectUrl) ? redirectUrl : '/'
            }
        }
    } catch (error) {
        console.error('Auth redirect error:', error)
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'auth_failed')
        if (redirectUrl) {
            loginUrl.searchParams.set('redirect_url', redirectUrl)
        }
        redirect(loginUrl.toString())
    }

    // ✅ SIEMPRE agregar parámetro de loading para UX inmediata
    const finalUrl = new URL(finalRedirectUrl, request.url)
    finalUrl.searchParams.set('_authLoading', '1')
    redirect(finalUrl.toString())
}

function isValidUrl(url: string): boolean {
    if (url.startsWith('/')) return true
    try {
        const urlObj = new URL(url)
        return urlObj.hostname === process.env.NEXT_PUBLIC_CLIENT_URL
    } catch {
        return false
    }
}