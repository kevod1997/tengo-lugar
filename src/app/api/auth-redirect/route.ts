// // app/api/auth-redirect/route.ts
// import { auth } from '@/lib/auth'
// import { getUserById } from '@/actions'
// import { redirect } from 'next/navigation'
// import { NextRequest } from 'next/server'
// import { VerificationStatus } from '@prisma/client'
// import { logError, LoggingService } from '@/services/logging/logging-service'
// import { TipoAccionUsuario } from '@/types/actions-logs'

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
//         // Toda la lógica de negocio aquí
//         const dbUser = await getUserById(session.user.id)

//         if (dbUser) {
//             // Log de la acción
//             const isNewUser = new Date().getTime() - new Date(dbUser.createdAt).getTime() < 60000

//             await LoggingService.logActionWithErrorHandling({
//                 userId: session.user.id,
//                 action: isNewUser ? TipoAccionUsuario.REGISTRO_USUARIO : TipoAccionUsuario.INICIO_SESION,
//                 status: 'SUCCESS',
//             }, {
//                 fileName: 'auth-redirect/route.ts',
//                 functionName: 'GET'
//             })

//             // Verificar si necesita completar verificaciones
//             const needsVerification =
//                 dbUser.identityStatus === VerificationStatus.FAILED ||
//                 dbUser.licenseStatus === VerificationStatus.FAILED ||
//                 dbUser.cars.some(car => car.insurance.status === VerificationStatus.FAILED)

//             if (needsVerification || !dbUser.hasBirthDate) {
//                 finalRedirectUrl = '/perfil'
//             } else {
//                 // Usuario está completo, usar la URL solicitada
//                 finalRedirectUrl = redirectUrl && isValidUrl(redirectUrl) ? redirectUrl : '/'
//             }
//         }
//     } catch (error) {
//         await logError({
//             origin: 'Auth Redirect',
//             code: 'AUTH_REDIRECT_ERROR',
//             message: 'Error al redirigir al usuario después de la autenticación',
//             details: error instanceof Error ? error.message : String(error),
//             fileName: 'auth-redirect/route.ts',
//             functionName: 'GET'
//         })

//         // En lugar de redirect a /perfil, dar más control
//         const loginUrl = new URL('/login', request.url)
//         loginUrl.searchParams.set('error', 'auth_failed')
//         loginUrl.searchParams.set('message', 'Error al verificar tu cuenta. Intenta de nuevo.')

//         if (redirectUrl) {
//             loginUrl.searchParams.set('redirect_url', redirectUrl)
//         }

//         redirect(loginUrl.toString())
//     }

//     const finalUrl = new URL(finalRedirectUrl, request.url)
//     finalUrl.searchParams.set('_refreshUser', '1')

//     redirect(finalUrl.toString())
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

// app/api/auth-redirect/route.ts (Optimizado)
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { logError, LoggingService } from '@/services/logging/logging-service'
import { TipoAccionUsuario } from '@/types/actions-logs'

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session) {
        redirect('/login')
    }

    const searchParams = request.nextUrl.searchParams
    const redirectUrl = searchParams.get('redirect_url')
    let finalUrl = '/'

    try {
        // ✅ Solo logging básico - sin fetch del usuario
        await LoggingService.logActionWithErrorHandling({
            userId: session.user.id,
            action: TipoAccionUsuario.INICIO_SESION,
            status: 'SUCCESS',
        }, {
            fileName: 'auth-redirect/route.ts',
            functionName: 'GET'
        })

        // ✅ Redirect rápido - AuthSessionHandler decide dónde ir
        const urlObj = new URL(redirectUrl && isValidUrl(redirectUrl) ? redirectUrl : '/', request.url)
        urlObj.searchParams.set('_refreshUser', '1')
        finalUrl = urlObj.toString()



    } catch (error) {
        await logError({
            origin: 'Auth Redirect',
            code: 'AUTH_REDIRECT_ERROR',
            message: 'Error al redirigir al usuario después de la autenticación',
            details: error instanceof Error ? error.message : String(error),
            fileName: 'auth-redirect/route.ts',
            functionName: 'GET'
        })

        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'auth_failed')
        loginUrl.searchParams.set('message', 'Error al verificar tu cuenta. Intenta de nuevo.')

        if (redirectUrl) {
            loginUrl.searchParams.set('redirect_url', redirectUrl)
        }

        redirect(loginUrl.toString())
    }
    redirect(finalUrl)
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