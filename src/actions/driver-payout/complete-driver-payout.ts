// src/actions/driver-payout/complete-driver-payout.ts
'use server'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { ServerActionError } from "@/lib/exceptions/server-action-error";

/**
 * TODO FASE 2: Complete a driver payout with transfer proof
 *
 * This action will:
 * 1. Verify that the payout exists and is in PROCESSING status
 * 2. Upload the transfer proof file to S3
 * 3. Update the payout with transfer proof fields (proofFileKey, transferDate, transferredBy, transferNotes)
 * 4. Update the payout status to COMPLETED
 * 5. Set completedAt field
 * 6. Send notification to the driver
 * 7. Log the action
 *
 * Requirements for Phase 2:
 * - Payout must be in PROCESSING status
 * - Transfer proof file must be provided (image or PDF)
 * - Transfer date must be provided
 * - Admin user performing the action must be authenticated
 * - Optional transfer notes
 *
 * Integration points:
 * - S3 upload service (@/lib/file/s3-upload)
 * - Email/notification service (Inngest job for driver notification)
 * - Update DriverPayout fields: proofFileKey, transferDate, transferredBy, transferNotes
 *
 * @param _payoutId - The ID of the payout to complete
 * @param _proofFileKey - The S3 key of the transfer proof file
 * @param _transferDate - The date of the transfer
 * @param _transferNotes - Optional notes about the transfer
 * @returns Completed payout object with transfer proof data
 * @throws ServerActionError if validations fail
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function completeDriverPayout(
  _payoutId: string,
  _proofFileKey: string,
  _transferDate: Date,
  _transferNotes?: string
) {
  throw ServerActionError.ValidationFailed(
    'complete-driver-payout.ts',
    'completeDriverPayout',
    'Funcionalidad no implementada - Fase 2. ' +
    'Incluirá carga de comprobante de transferencia a S3, actualización de campos de payout, ' +
    'y notificación al conductor.'
  );
}
