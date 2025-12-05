import { Suspense } from 'react'

import { getUsers } from '@/actions'
import Header from '@/components/header/header'

import { DashboardHeader } from './components/DashboardHeader'
import { DashboardShell } from './components/DashboardShell'
import { Pagination } from './components/Pagination'
import { UserFilter } from './components/UserFilter'
import { UserTable } from './components/UserTable'
import Loading from './loading'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    filter?: 'all' | 'pending';
  }>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const filter = params.filter || 'all'

  const { users, pagination } = await getUsers({ page, pageSize, filter })

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Dashboard' },
        ]}
      />
      <DashboardShell>
        <DashboardHeader
          heading="Admin Dashboard"
          text="Administra los usuarios y sus verificaciones."
        />
        <UserFilter currentFilter={filter} />
        <Suspense fallback={<Loading />}>
          <UserTable users={users} />
        </Suspense>
        <Pagination {...pagination} urlBased={true}
          totalLabel="Usuarios" />
      </DashboardShell>
    </>
  )
}