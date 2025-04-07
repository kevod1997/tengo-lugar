import { getTripById } from '@/actions/trip/get-trip-by-id'
import { notFound } from 'next/navigation'
import TripDetail from './components/TripDetail'

export default async function TripPage({ params }: { params: Promise<{ id: string }>}) {
  const resolvedParams = await params;
  const trip = await getTripById(resolvedParams.id);

  if (!trip) {
    notFound();
  }

  return <TripDetail trip={trip} />
}