// src/actions/driver-payout/process-driver-payout.ts
'use server'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { ServerActionError } from "@/lib/exceptions/server-action-error";

/**
 * TODO FASE 2: Process a driver payout (change status to PROCESSING)
 *
 * This action will:
 * 1. Verify that the payout exists and is in PENDING status
 * 2. Verify that the driver has verified bank information
 * 3. Update the payout status to PROCESSING
 * 4. Set processedBy and processedAt fields
 * 5. Log the action
 *
 * Requirements for Phase 2:
 * - Driver must have bankInfoVerified = true
 * - Driver must have bankCbuOrCvu filled
 * - Payout must be in PENDING status
 * - Admin user performing the action must be authenticated
 *
 * @param _payoutId - The ID of the payout to process
 * @returns Updated payout object
 * @throws ServerActionError if validations fail
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function processDriverPayout(_payoutId: string) {
  throw ServerActionError.ValidationFailed(
    'process-driver-payout.ts',
    'processDriverPayout',
    'Funcionalidad no implementada - Fase 2. ' +
    'Incluirá verificación de información bancaria del conductor y cambio de estado a PROCESSING.'
  );
}
