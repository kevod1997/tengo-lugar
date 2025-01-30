import { Suspense } from 'react'
import { getUnverifiedUsers } from '@/actions'
import { UserTable } from './components/UserTable'
import { Pagination } from './components/Pagination'
import { DashboardHeader } from './components/DashboardHeader'
import { DashboardShell } from './components/DashboardShell'
import Loading from './loading'
import Header from '@/components/header/header'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10

  const { users, pagination } = await getUnverifiedUsers({ page, pageSize })

  return (
    <>
      <Header breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Admin', href: '/admin' },
        { label: 'Dashboard' },
      ]} />
      <DashboardShell>
        <DashboardHeader
          heading="Admin Dashboard"
          text="Administra a los usuarios con verificacion pendiente."
        />
        <Suspense fallback={<Loading />}>
          <UserTable users={users} />
        </Suspense>
        <Pagination {...pagination} />
      </DashboardShell>
    </>
  )
}

