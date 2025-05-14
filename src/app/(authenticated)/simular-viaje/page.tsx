import { getFuels } from '@/actions/fuel/get-fuels'
import RouteCalculator from './components/RouteCalculator'

export default async function RouteSimulatorPage() {
  // Get API key on the server
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  
  // Await the promise and extract the data
  const fuelsResponse = await getFuels()
  const fuelsData = fuelsResponse?.data || []
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Simulador de Viaje</h1>
      <RouteCalculator 
        apiKey={apiKey}
        initialOrigin=""
        initialDestination=""
        fuels={fuelsData}
      />
    </div>
  )
}