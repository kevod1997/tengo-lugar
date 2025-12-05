import { CheckCircle, Clock, XCircle } from "lucide-react";

import type { VerificationStatus } from "@prisma/client";

interface StatusIndicatorProps {
    status?: string | null;
    showIcon?: boolean;
  }
  
  export function StatusIndicator({ status, showIcon = true }: StatusIndicatorProps) {
    if (!status || !showIcon) return null;
  
    const statusConfig = {
      PENDING: {
        icon: Clock,
        color: "text-yellow-500"
      },
      FAILED: {
        icon: XCircle,
        color: "text-red-500"
      },
      VERIFIED: {
        icon: CheckCircle,
        color: "text-green-500"
      }
    };
  
    const config = statusConfig[status as VerificationStatus];
    const Icon = config.icon;
  
    return <Icon className={`ml-2 h-4 w-4 ${config.color}`} />;
  }