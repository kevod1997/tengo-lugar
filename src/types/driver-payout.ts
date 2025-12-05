import type { PayoutStatus, PaymentMethod } from '@prisma/client';

/**
 * Driver Payout Calculation Details
 * Represents the breakdown of payout calculation
 */
export interface DriverPayoutCalculation {
  totalReceived: number; // Total amount received from valid passengers
  serviceFee: number; // Platform commission
  lateCancellationPenalty: number; // Penalty for late cancellations
  lateCancellationCount: number; // Number of late cancellations
  payoutAmount: number; // Final amount to pay driver
  validPassengersCount: number; // Number of passengers with completed payments
}

/**
 * Driver Payout with related data
 * Extended type for UI display
 */
export interface DriverPayoutWithDetails {
  id: string;
  tripId: string;
  driverId: string;
  payoutAmount: number;
  totalReceived?: number;
  serviceFee?: number;
  lateCancellationPenalty?: number;
  currency: string;
  status: PayoutStatus;
  payoutMethod: PaymentMethod;
  notes: string | null;
  processedBy: string | null;
  proofFileKey: string | null;
  transferDate: Date | null;
  transferredBy: string | null;
  transferNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  processedAt: Date | null;
  completedAt: Date | null;
  driver: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      profileImageKey: string | null;
      bankAccount: {
        bankAlias: string;
        bankCbuOrCvu: string | null;
        isVerified: boolean;
      } | null;
    };
  };
  trip: {
    id: string;
    originCity: string;
    originProvince: string;
    destinationCity: string;
    destinationProvince: string;
    departureTime: Date;
    price: number;
    status: string;
    chatRoomId: string | null;
  };
}

/**
 * Filters for querying driver payouts
 */
export interface GetDriverPayoutsParams {
  page?: number;
  pageSize?: number;
  status?: PayoutStatus | 'ALL';
  searchTerm?: string;
  driverId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Response from get-driver-payouts action
 */
export interface GetDriverPayoutsResponse {
  payouts: DriverPayoutWithDetails[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Status badge configuration
 */
export interface PayoutStatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'warning' | 'success';
  description: string;
}

/**
 * Payout status configurations map
 */
export const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, PayoutStatusConfig> = {
  PENDING: {
    label: 'Pendiente',
    variant: 'warning',
    description: 'Pago pendiente de procesamiento',
  },
  PROCESSING: {
    label: 'Procesando',
    variant: 'default',
    description: 'Pago en proceso de transferencia',
  },
  COMPLETED: {
    label: 'Completado',
    variant: 'success',
    description: 'Pago completado exitosamente',
  },
  FAILED: {
    label: 'Fallido',
    variant: 'destructive',
    description: 'Error al procesar el pago',
  },
  ON_HOLD: {
    label: 'En Espera',
    variant: 'secondary',
    description: 'Pago retenido (sin info bancaria o monto $0)',
  },
  CANCELLED: {
    label: 'Cancelado',
    variant: 'secondary',
    description: 'Pago cancelado',
  },
};
