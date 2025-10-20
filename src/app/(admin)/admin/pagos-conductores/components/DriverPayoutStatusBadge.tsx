// src/app/(admin)/admin/pagos-conductores/components/DriverPayoutStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { PayoutStatus } from "@prisma/client";
import { PAYOUT_STATUS_CONFIG } from "@/types/driver-payout";

interface DriverPayoutStatusBadgeProps {
  status: PayoutStatus;
  className?: string;
}

export function DriverPayoutStatusBadge({ status, className }: DriverPayoutStatusBadgeProps) {
  const config = PAYOUT_STATUS_CONFIG[status];

  return (
    <Badge
      variant={config.variant}
      className={className}
      title={config.description}
    >
      {config.label}
    </Badge>
  );
}
