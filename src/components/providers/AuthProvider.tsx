'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback  // Add this import
} from 'react'
import { useUserStore } from '@/store/user-store'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { getUserById } from '@/actions/register/user/get-user'
import { FormattedUser } from '@/types/user-types'
import { VerificationStatus } from '@prisma/client'
import { LoggingService } from '@/services/logging/logging-service'
import { TipoAccionUsuario } from '@/types/actions-logs'

type AuthContextType = {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: FormattedUser | null;
    clearSession: () => void;
    refreshUserData: (userId?: string) => Promise<FormattedUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Utility function for URL validation
const isValidRedirectUrl = (url: string) => {
    if (url.startsWith('/')) return true

    try {
        const urlObj = new URL(url)
        return urlObj.hostname === window.location.hostname
    } catch {
        return false
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, isPending } = authClient.useSession()
    const { user, setUser, clearUser } = useUserStore()
    const [isLoading, setIsLoading] = useState(true)
    const [hasHandledInitialAuth, setHasHandledInitialAuth] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Check if we're on the auth redirect page
    const isAuthRedirectPage = pathname === '/auth-redirect'

    // Function to fetch user data - wrapped in useCallback
    const refreshUserData = useCallback(async (userId?: string) => {
        try {
            const userData = await getUserById(userId || session?.user.id)
            if (userData) {
                setUser(userData)
                return userData
            }
            return null
        } catch (error) {
            console.error('Failed to fetch user data:', error)
            return null
        }
    }, [session?.user.id, setUser]) // Include dependencies here

    // Manual logout function - wrapped in useCallback
    const clearSession = useCallback(async () => {
        try {
            // First clear local data
            clearUser()
            localStorage.removeItem('user-storage')

            // Then sign out from the server (which might redirect)
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: async () => {
                        router.push("/");
                        router.refresh();
                        await LoggingService.logActionWithErrorHandling(
                            {
                                userId: session?.user.id ?? '',
                                action: TipoAccionUsuario.CIERRE_SESION,
                                status: 'SUCCESS',
                            },
                            {
                                fileName: 'nav-user.tsx',
                                functionName: 'handleSignOut'
                            }
                        );
                    },
                },
            });

            // Show success toast
            toast.success('Sesión cerrada correctamente', {
                duration: 2000,
            })
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
            toast.error('Error al cerrar sesión')
        }
    }, [clearUser, router, session?.user.id]) // Include dependencies here

    // Handle authentication state changes
    useEffect(() => {
        if (!isPending) {
            setIsLoading(false)

            // If we have a session but no user data in the store, fetch it
            if (session?.user?.id && !user) {
                refreshUserData()
            }

            // If session is gone but we have user data stored, clear it
            if (!session && user) {
                clearUser()
                localStorage.removeItem('user-storage')

                // Only show toast if we're not on login or auth pages
                if (!pathname.includes('/login') && !pathname.includes('/auth')) {
                    toast.error('Su sesión ha expirado', { duration: 2000 })
                    router.push('/login')
                }
            }

            // Handle auth redirect logic similar to your auth-redirect page
            // Only run this once when authentication state is first determined
            if (!hasHandledInitialAuth) {
                const handleAuthRedirect = async () => {
                    if (session?.user?.id) {
                        // User is authenticated
                        try {
                            const dbUser = await refreshUserData()

                            // Log authentication action if on auth redirect page
                            if (isAuthRedirectPage) {
                                // Detect if it's a new user
                                const isNewUser = dbUser &&
                                    new Date().getTime() - new Date(dbUser.createdAt).getTime() < 60000;

                                await LoggingService.logActionWithErrorHandling(
                                    {
                                        userId: session.user.id,
                                        action: isNewUser ? TipoAccionUsuario.REGISTRO_USUARIO : TipoAccionUsuario.INICIO_SESION,
                                        status: 'SUCCESS',
                                    },
                                    {
                                        fileName: 'AuthProvider.tsx',
                                        functionName: 'handleAuthRedirect'
                                    }
                                );

                                // Check if user needs to complete profile or fix verification
                                if (dbUser) {
                                    const needsVerification =
                                        dbUser.identityStatus === VerificationStatus.FAILED ||
                                        dbUser.licenseStatus === VerificationStatus.FAILED ||
                                        dbUser.cars.some(car => car.insurance.status === VerificationStatus.FAILED);

                                    if (needsVerification) {
                                        router.push('/dashboard');
                                        return;
                                    }

                                    if (dbUser.hasBirthDate === false) {
                                        router.push('/dashboard');
                                        return;
                                    }

                                    // Get and validate redirect URL
                                    const redirectUrl = searchParams.get('redirect_url') || '/';
                                    const safeRedirectUrl = redirectUrl && isValidRedirectUrl(redirectUrl)
                                        ? redirectUrl
                                        : '/';

                                    router.push(safeRedirectUrl);
                                }
                            }
                        } catch (error) {
                            console.error('Error handling auth redirect:', error);
                        }
                    } else if (!session && isAuthRedirectPage) {
                        // Not authenticated but on auth redirect page
                        const redirectUrl = searchParams.get('redirect_url');
                        const safeRedirectUrl = redirectUrl && isValidRedirectUrl(redirectUrl)
                            ? redirectUrl
                            : '/login';

                        const loginUrl = redirectUrl
                            ? `/login?redirect_url=${encodeURIComponent(safeRedirectUrl)}`
                            : '/login';

                        router.push(loginUrl);
                    }
                };

                handleAuthRedirect();
                setHasHandledInitialAuth(true);
            }
        }
    }, [
        session,
        isPending,
        user,
        setUser,
        clearUser,
        router,
        pathname,
        searchParams,
        hasHandledInitialAuth,
        isAuthRedirectPage,
        refreshUserData,
    ]);

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                isAuthenticated: !!session,
                user,
                clearSession,
                refreshUserData
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}