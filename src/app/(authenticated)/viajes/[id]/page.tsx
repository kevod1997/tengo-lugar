import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { getTripById, canUserReserveTrip } from '@/actions/trip/get-trip-by-id';
import NotFound from '@/app/not-found';
import HeaderV2 from '@/components/header/HeaderV2';
import { auth } from '@/lib/auth';

import TripDetail from './components/TripDetail';



export default async function TripPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Check if autoOpenReview query param is present
  const autoOpenReview = resolvedSearchParams.openReview === 'true';

  if (!session) {
    redirect(`/login?redirect_url=/viajes/${resolvedParams.id}`);
  }

  try {
    const trip = await getTripById(resolvedParams.id);

    if (!trip) {
     return <NotFound />;
    }

    // Verificar si el usuario puede reservar este viaje
    const reserveCheck = await canUserReserveTrip(resolvedParams.id);

    return (
      <>
        <HeaderV2
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Viajes', href: '/viajes' },
            { label: 'Detalle del viaje' }
          ]}
        />
        <div className="page-content">
        <TripDetail
          trip={trip}
          userId={session.user.id}
          canReserve={reserveCheck.canReserve}
          reserveReason={reserveCheck.reason}
          availableSeats={reserveCheck.remainingSeats || trip.remainingSeats}
          autoOpenReview={autoOpenReview}
        />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching trip:', error);
    notFound();
  }
}