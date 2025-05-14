import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Header from '@/components/header/header';
import { headers } from 'next/headers';
import { UserProfileView } from './components/UserProfileView';
import { getUserProfileById } from '@/actions/user/get-user-profile-by-id';

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const resolvedParams = await params;
  if (!session) {
    redirect(`/login?redirect_url=/viajes/${resolvedParams.id}`);
  }

  try {
    const user = await getUserProfileById(resolvedParams.id);

    if (!user) {
      notFound();
    }

    return (
        <>
        <Header
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Perfil', href: `/perfil/${resolvedParams.id}` },
          ]}
        />
          <UserProfileView profile={user} />
      </>
    );
  } catch (error) {
    console.error('Error fetching trip:', error);
    notFound();
  }
}