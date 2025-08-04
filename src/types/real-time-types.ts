// src/types/real-time-types.ts
import { NotificationType, VerificationStatus, TripStatus, ReservationStatus, PaymentStatus } from "@prisma/client";

// Notification Channel Types (compatible with WebSocket server)
export type NotificationChannel = 
  | `user-updates:${string}`     // user-updates:userId
  | `trip-updates:${string}`     // trip-updates:tripId
  | 'admin-updates';             // System-wide admin notifications

// State Update Payloads for Different Notification Types
export interface UserVerificationStateUpdate {
  type: 'user_verification_update';
  userId: string;
  verificationField: 'identityStatus' | 'licenseStatus' | 'vehicleCardStatus' | 'insuranceStatus';
  status: VerificationStatus;
  failureReason?: string;
  partialUserUpdate: {
    identityStatus?: VerificationStatus;
    licenseStatus?: VerificationStatus;
    identityFailureReason?: string | null;
    licenseFailureReason?: string | null;
  };
}

export interface TripStateUpdate {
  type: 'trip_status_update';
  tripId: string;
  status: TripStatus;
  affectedUserIds: string[]; // Driver + passengers
  details?: {
    remainingSeats?: number;
    cancelReason?: string;
  };
}

export interface ReservationStateUpdate {
  type: 'reservation_update';
  tripId: string;
  passengerId: string;
  driverId: string;
  reservationStatus: ReservationStatus;
  details?: {
    rejectionReason?: string;
    seatsReserved?: number;
  };
}

export interface PaymentStateUpdate {
  type: 'payment_status_update';
  paymentId: string;
  userId: string;
  tripId: string;
  status: PaymentStatus;
  amount?: number;
}

// Union type for all possible state updates
export type StateUpdate = 
  | UserVerificationStateUpdate
  | TripStateUpdate
  | ReservationStateUpdate
  | PaymentStateUpdate;

// Server-side Redis Message Format (compatible with WebSocket server)
export interface RedisRealtimeMessage {
  userId?: string;
  tripId?: string;
  channels: NotificationChannel[];
  stateUpdate: StateUpdate;
  notificationType: NotificationType;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

// Real-time Notification Mapping
export interface NotificationToRealtimeMapping {
  [NotificationType.VERIFICATION_APPROVED]: UserVerificationStateUpdate;
  [NotificationType.VERIFICATION_FAILED]: UserVerificationStateUpdate;
  [NotificationType.LICENSE_VERIFIED]: UserVerificationStateUpdate;
  [NotificationType.LICENSE_FAILED]: UserVerificationStateUpdate;
  [NotificationType.VEHICLE_CARD_VERIFIED]: UserVerificationStateUpdate;
  [NotificationType.VEHICLE_CARD_FAILED]: UserVerificationStateUpdate;
  [NotificationType.INSURANCE_VERIFIED]: UserVerificationStateUpdate;
  [NotificationType.INSURANCE_FAILED]: UserVerificationStateUpdate;
  [NotificationType.TRIP_CREATED]: TripStateUpdate;
  [NotificationType.TRIP_CANCELLED]: TripStateUpdate;
  [NotificationType.RESERVATION_APPROVED]: ReservationStateUpdate;
  [NotificationType.RESERVATION_REJECTED]: ReservationStateUpdate;
  [NotificationType.RESERVATION_CANCELLED]: ReservationStateUpdate;
  [NotificationType.PAYMENT_COMPLETED]: PaymentStateUpdate;
  [NotificationType.PAYMENT_FAILED]: PaymentStateUpdate;
}

// Publishing options
export interface RealtimePublishOptions {
  channels?: NotificationChannel[];
  priority?: 'low' | 'medium' | 'high';
  userId?: string;
  tripId?: string;
}