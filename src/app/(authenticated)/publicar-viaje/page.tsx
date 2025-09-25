import { getFuels } from '@/actions/fuel/get-fuels'
import RouteCalculator from './components/RouteCalculator'
import Header from '@/components/header/header'
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getDriverEligibility } from '@/actions/driver/driver-eligibility';
import { getEnabledDriverCars } from '@/actions/driver/get-driver-cars';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function RouteSimulatorPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?redirect_url=/publicar-viaje");
  }

  // 1. Verificar elegibilidad del driver primero
  const driverEligibility = await getDriverEligibility(session.user.id)

  // 2. Early return si no está habilitado - evita llamadas innecesarias
  if (!driverEligibility.isEnabled) {
    return (
      <>
        <Header
          breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Publicar Viaje' }]}
          showBackButton={false}
        />
        <div className="page-container">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">No puedes publicar viajes aún</AlertTitle>
            <AlertDescription className="text-orange-700 space-y-4">
              <p>{driverEligibility.reason}</p>
              <Link href="/perfil?setup=driver">
                <Button className="w-full sm:w-auto">
                  Completar requisitos en mi perfil
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  // 3. Solo si está habilitado, ejecutar las demás llamadas en paralelo
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const [fuelsResponse, carsResponse] = await Promise.all([
    getFuels(),
    getEnabledDriverCars()
  ])

  const fuelsData = fuelsResponse?.data || []
  const enabledCars = carsResponse?.data || []

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Publicar Viaje' }]}
        showBackButton={false}
      />
      <div className="page-content">
        <RouteCalculator
          apiKey={apiKey}
          initialOrigin=""
          initialDestination=""
          fuels={fuelsData}
          cars={enabledCars}
        />
      </div>
    </>
  )
}