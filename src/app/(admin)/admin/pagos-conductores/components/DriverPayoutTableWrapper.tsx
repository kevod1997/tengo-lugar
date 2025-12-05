'use client'

import { useRouter } from 'next/navigation'

import type { DriverPayoutWithDetails } from '@/types/driver-payout'

import { DriverPayoutTable } from './DriverPayoutTable'

interface DriverPayoutTableWrapperProps {
  payouts: DriverPayoutWithDetails[]
}

export function DriverPayoutTableWrapper({ payouts }: DriverPayoutTableWrapperProps) {
  const router = useRouter()

  const handleUpdate = () => {
    // Refresh the page data after successful payout action
    router.refresh()
  }

  return <DriverPayoutTable payouts={payouts} onUpdate={handleUpdate} />
}
