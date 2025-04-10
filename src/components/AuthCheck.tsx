// 'use client'

// import { useEffect, useRef } from 'react'
// import { useUserStore } from '@/store/user-store'
// import { toast } from 'sonner'
// import { FormattedUser } from '@/types/user-types'
// import { authClient } from '@/lib/auth-client'

// //todo ver que hay un error que me saca la info del storage cuando hay error en la sesion y no deberia porque la misma persiste.

// export function AuthCheck() {
//   const { data, isPending } = authClient.useSession();
//   const user = useUserStore((state: { user: FormattedUser | null }) => state.user)
//   const clearUser = useUserStore((state) => state.clearUser)
//   const wasSignedInRef = useRef(false)

//   useEffect(() => {
//     if (!isPending) {
//       // Si hay usuario en el store, marcamos que estuvo iniciada la sesión
//       if (user) {
//         wasSignedInRef.current = true;
//       }
      
//       // Si NO hay sesión activa pero SÍ hay usuario en el store
//       if (!data && user) {
//         clearUser();
//         localStorage.removeItem('user-storage');
//         toast.error('Se ha cerrado tu sesión', {
//           duration: 2000,
//         });
//       }
//     }
//   }, [isPending, data, user, clearUser]);

//   return null;
// }