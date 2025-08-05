'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import Header from "@/components/header/header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Loading from '../../loading'
import { toast } from 'sonner'

export default function VehiculosPage() {
    const { user } = useUserStore()
    const router = useRouter()

    // Función auxiliar para mostrar el estado del seguro de manera amigable
    const getInsuranceStatus = (status: string | null) => {
        switch (status) {
            case 'VERIFIED':
                return {
                    label: 'Verificado',
                    icon: CheckCircle2,
                    className: 'bg-green-500',
                }
            case 'PENDING':
                return {
                    label: 'Pendiente',
                    icon: Clock,
                    className: 'bg-yellow-500',
                }
            case 'FAILED':
                return {
                    label: 'Rechazado',
                    icon: AlertCircle,
                    className: 'bg-red-500',
                }
            default:
                return {
                    label: 'Sin seguro',
                    icon: AlertCircle,
                    className: 'bg-gray-500',
                }
        }
    }

    useEffect(() => {
        if (!user?.cars === undefined) {
            router.push('/dashboard')
        }
    }, [user, router])

    // Si el usuario no está cargado o no tiene autos, mostramos un estado de carga
    if (!user?.cars === undefined) {
        return <Loading />
    }

    return (
        <>
            <Header
                breadcrumbs={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Perfil', href: '/perfil' },
                    { label: 'Vehículos' },
                ]}
            />
            <div className="page-content">

                {!user?.hasRegisteredCar && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No tienes vehículos registrados</AlertTitle>
                        <AlertDescription>
                            Para poder ofrecer viajes, necesitas registrar al menos un vehículo con su seguro correspondiente.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6">
                    {/* Sección de vehículos registrados */}
                    {user?.cars.map((car) => {
                        const insuranceStatus = getInsuranceStatus(car.insurance.status)
                        const InsuranceIcon = insuranceStatus.icon

                        return (
                            <Card key={car.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle>{car.plate}</CardTitle>
                                        <CardDescription>
                                            {car.brand} {car.model} {car.year}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`${insuranceStatus.className} text-white`}
                                    >
                                        <InsuranceIcon className="mr-1 h-4 w-4" />
                                        {insuranceStatus.label}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    {car.insurance.status === 'FAILED' && (
                                        <Alert variant="destructive" className="mt-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Seguro rechazado</AlertTitle>
                                            <AlertDescription>
                                                {car.insurance.failureReason}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {car.insurance.status !== 'VERIFIED' && (
                                        <Button
                                            variant="secondary"
                                            className="mt-4"
                                            asChild
                                        >
                                            <Link href={`/vehiculos/${car.id}/seguro`}>
                                                Actualizar seguro
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}

                    {/* Botón para agregar nuevo vehículo */}
                    <Button
                        className="w-full py-8"
                        onClick={() => {
                            toast.warning('Funcionalidad en desarrollo')
                            // router.push('/vehiculos/nuevo')

                        }}
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Agregar vehículo
                    </Button>
                </div>

                {/* Información adicional sobre verificación pendiente */}
                {user?.hasPendingInsurance && (
                    <Alert className="mt-6">
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Verificación en proceso</AlertTitle>
                        <AlertDescription>
                            Algunos de tus seguros están siendo verificados. Te notificaremos cuando el proceso esté completo.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>
    )
}