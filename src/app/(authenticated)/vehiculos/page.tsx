import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getDriverCars } from '@/actions/driver/get-driver-cars'
import Header from "@/components/header/header"
import { auth } from '@/lib/auth'

import VehiculosContent from './components/VehiculosContent'

export default async function VehiculosPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login?redirect_url=/vehiculos");
    }

    const carsResponse = await getDriverCars();

    if (!carsResponse.success) {
        redirect('/dashboard');
    }

    const cars = carsResponse.data;

    if (!cars || cars.length === 0) {
        redirect('/dashboard');
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
            <VehiculosContent cars={cars} />
        </>
    )
}