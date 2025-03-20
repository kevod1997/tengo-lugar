'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUserStore } from '@/store/user-store'
import { useRouter } from 'next/navigation'
import ProfileForm from "./ProfileForm"
import AccountManagement from "./AccountManagement"
import { useHydration } from "@/hooks/ui/useHydration"
import { HydrationLoading } from "@/components/ui/hydration-loading"
import PushNotificationManager from "@/components/notifications/PushNotificationManager"

interface ProfileContentProps { 
    birthDate: Date | null | undefined;
    phoneNumber: string | null | undefined
 }

export default function ProfileContent({ birthDate, phoneNumber }: ProfileContentProps) {
    const { user } = useUserStore()
    const router = useRouter()

    const { isHydrated } = useHydration({
        isHydratedFn: () => useUserStore.getState().user !== null
    })

    if (!isHydrated) {
        return (
            <HydrationLoading
                message="Cargando perfil..."
                size="md"
                className="mt-16"
            />
        )
    }

    if (!user) {
        return (
            <div className="mt-6 w-full flex justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold">Información no disponible</h2>
                        <p className="text-muted-foreground">No se encontró información del usuario</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (birthDate === null) {
        return (
            <div className="container mx-auto p-4 max-w-3xl">
                <Alert className="my-6 bg-card border">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Registro incompleto</AlertTitle>
                    <AlertDescription>
                        <p className="mb-4">Necesitas completar tu información personal para poder usar todas las funcionalidades.</p>
                        <Button variant="default" onClick={() => router.push('/dashboard')}>
                            Completar registro
                        </Button>
                    </AlertDescription>
                </Alert>

                <Card className="mt-6">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>No podrás acceder a todas las funciones hasta que completes tu registro.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <ProfileForm 
                isIdentityVerified={user.identityStatus === 'VERIFIED'} 
                birthDate={birthDate} 
                phoneNumber={phoneNumber} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccountManagement />
            </div>
            <PushNotificationManager />
        </div>
    )
}