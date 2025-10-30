'use client'

import { useRouter } from 'next/navigation'
import { DriverPayoutTable } from './DriverPayoutTable'
import { DriverPayoutWithDetails } from '@/types/driver-payout'

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
