import { Suspense } from 'react'
import Header from '@/components/header/header'
import { LoadingOverlay } from '@/components/loader/loading-overlay'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import IntegratedProfileContent from './components/IntegratedProfileContent';

export default async function UserProfilePage() {
  //todo ver cuando se ceirra el modal de registration flow porque hubo exito ( ejemplo en el flujo de pasajero registra el documento, se actualice tambien la info del perfil como hice cuando cierra el modal con el dialogo)

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
      <Suspense fallback={<LoadingOverlay isLoading={true} />}>
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

// import { Suspense } from 'react'
// import Header from '@/components/header/header'
// import { LoadingOverlay } from '@/components/loader/loading-overlay'
// import { auth } from '@/lib/auth';
// import { headers } from 'next/headers';
// import EnhancedProfileContent from './components/EnhancedProfileContent';
// import { redirect } from 'next/navigation';
// import { getUserById } from '@/actions';
// import { LoggingService } from '@/services/logging/logging-service';
// import { TipoAccionUsuario } from '@/types/actions-logs';

// export default async function ProfilePage({
//   searchParams
// }: {
//   searchParams: Promise<{ redirect_url?: string; from?: string }>
// }) {

//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   const resolvedSearchParams = await searchParams;


//   if (!session) {
//     const redirectPath = resolvedSearchParams.redirect_url 
//       ? `/login?redirect_url=${encodeURIComponent(resolvedSearchParams.redirect_url)}`
//       : '/login';
    
//     redirect(redirectPath);
//   }

//   const user = await getUserById(session.user.id);
//   const { birthDate, phoneNumber } = session!.user;

//   const isFromLogin = resolvedSearchParams.from === 'login';
//   if (isFromLogin) {
//     // Detectamos si es un usuario nuevo por su fecha de creación 
//     // (usuario creado hace menos de 1 minuto)
//     const isNewUser = user && 
//       new Date().getTime() - new Date(user.createdAt).getTime() < 60000;
    
//     await LoggingService.logActionWithErrorHandling(
//       {
//         userId: session.user.id,
//         action: isNewUser ? TipoAccionUsuario.REGISTRO_USUARIO : TipoAccionUsuario.INICIO_SESION,
//         status: 'SUCCESS',
//       },
//       {
//         fileName: 'perfil/page.tsx',
//         functionName: 'ProfilePage'
//       }
//     );
//   }

//   return (
//     <div className="flex flex-col w-full">
//       <Header
//         breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Perfil' }]}
//         showBackButton={false}
//       />
//       <Suspense fallback={<LoadingOverlay isLoading={true} />}>
//         <EnhancedProfileContent
//           birthDate={birthDate}
//           phoneNumber={phoneNumber}
//           userId={session!.user.id}
//           user={user}
//         />
//       </Suspense>
//     </div>
//   )
// }