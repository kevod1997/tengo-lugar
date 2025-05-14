import { getTripById, canUserReserveTrip } from '@/actions/trip/get-trip-by-id';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import TripDetail from './components/TripDetail';
import Header from '@/components/header/header';
import { headers } from 'next/headers';

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const resolvedParams = await params;
  if (!session) {
    redirect(`/login?redirect_url=/viajes/${resolvedParams.id}`);
  }

  try {
    const trip = await getTripById(resolvedParams.id);

    if (!trip) {
      notFound();
    }

    // Verificar si el usuario puede reservar este viaje
    const reserveCheck = await canUserReserveTrip(resolvedParams.id);

    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Viajes', href: '/viajes' },
            { label: 'Detalle del viaje' }
          ]}
        />
        <TripDetail
          trip={trip}
          userId={session.user.id}
          canReserve={reserveCheck.canReserve}
          reserveReason={reserveCheck.reason}
          availableSeats={reserveCheck.remainingSeats || trip.remainingSeats}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching trip:', error);
    notFound();
  }
}