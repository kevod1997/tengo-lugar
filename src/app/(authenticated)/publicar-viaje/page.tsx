// import { getFuels } from '@/actions/fuel/get-fuels'
// import RouteCalculator from './components/RouteCalculator'
// import Header from '@/components/header/header'
// import { redirect } from 'next/navigation';
// import { headers } from 'next/headers';
// import { auth } from '@/lib/auth';
// import { getDriverEligibility } from '@/actions/driver/driver-eligibility';

// export default async function RouteSimulatorPage() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     redirect("/login?redirect_url=/publicar-viaje");
//   }
//   // Get API key on the server
//   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

//   // Await the promise and extract the data
//   const fuelsResponse = await getFuels()
//   const fuelsData = fuelsResponse?.data || []
//   const isDriver = await getDriverEligibility(session.user.id)

//   return (
//     <div className="container mx-auto py-8">
//       <Header
//         breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Publicar Viaje' }]}
//         showBackButton={false}
//       />
//       <RouteCalculator
//         apiKey={apiKey}
//         initialOrigin=""
//         initialDestination=""
//         fuels={fuelsData}
//       />
//     </div>
//   )
// }

import { getFuels } from '@/actions/fuel/get-fuels'
import RouteCalculator from './components/RouteCalculator'
import Header from '@/components/header/header'
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getDriverEligibility } from '@/actions/driver/driver-eligibility';
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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const fuelsResponse = await getFuels()
  const fuelsData = fuelsResponse?.data || []
  const driverEligibility = await getDriverEligibility(session.user.id)

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
        />
      </div>
    </>
  )
}