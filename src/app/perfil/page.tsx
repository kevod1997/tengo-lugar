import { Suspense } from 'react'
import Header from '@/components/header/header'
import { LoadingOverlay } from '@/components/loader/loading-overlay'
import ProfileContent from './componenetes/ProfileContent'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function UserProfilePage() {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { birthDate, phoneNumber } = session!.user;

  return (
    <div className="flex flex-col w-full">
      <Header
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Perfil' }]}
        showBackButton={false}
      />
      <Suspense fallback={<LoadingOverlay isLoading={true} />}>
        <ProfileContent birthDate={birthDate} phoneNumber={phoneNumber} />
      </Suspense>
    </div>
  )
}