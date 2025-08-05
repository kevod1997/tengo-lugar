// components/nav-user-dynamic.tsx
import dynamic from 'next/dynamic'
import { NavUserSkeletonClient } from './nav-skeleton'

export const NavUserDynamic = dynamic(
  () => import('./nav-user').then(mod => ({ default: mod.NavUser })),
  {
    ssr: false,
    loading: () => <NavUserSkeletonClient open={true} />
  }
)