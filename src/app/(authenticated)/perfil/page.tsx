import { Suspense } from 'react'
import Header from '@/components/header/header'
import { LoadingOverlay } from '@/components/loader/loading-overlay'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import IntegratedProfileContent from './components/IntegratedProfileContent';

export default async function UserProfilePage() {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { birthDate, phoneNumber, gender } = session!.user;

  return (
    <div className="flex flex-col w-full">
      <Header
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Perfil' }]}
        showBackButton={false}
      />
      <Suspense fallback={<LoadingOverlay customMessage='Cargando perfil...' forceShow />}>
         <IntegratedProfileContent 
          birthDate={birthDate} 
          phoneNumber={phoneNumber} 
          gender={gender}
          userId={session!.user.id}
        />
      </Suspense>
    </div>
  )
}