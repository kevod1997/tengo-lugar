// src/actions/driver-payout/process-driver-payout.ts
'use server'

import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import prisma from "@/lib/prisma";
import { processDriverPayoutSchema } from "@/schemas/validation/driver-payout-schema";
import { notifyUser } from "@/utils/notifications/notification-helpers";

/**
 * Procesa un payout de conductor (cambia estado de PENDING a PROCESSING)
 *
 * Validaciones:
 * - Payout debe existir y estar en estado PENDING
 * - Conductor debe tener BankAccount verificada
 * - Solo admins pueden ejecutar esta acción
 *
 * @param payoutId - ID del payout a procesar
 * @returns Payout actualizado
 */
export async function processDriverPayout(payoutId: string) {
  try {
    const session = await requireAuthorization('admin', 'process-driver-payout.ts', 'processDriverPayout');

    // Validar input
    const validatedData = processDriverPayoutSchema.parse({
      payoutId,
      processedBy: session.user.id,
    });

    // Obtener payout con información del conductor
    const payout = await prisma.driverPayout.findUnique({
      where: { id: validatedData.payoutId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                bankAccount: {
                  select: {
                    id: true,
                    isVerified: true,
                    bankAlias: true,
                  }
                }
              }
            }
          }
        },
        trip: {
          select: {
            id: true,
            originCity: true,
            destinationCity: true,
            departureTime: true,
          }
        }
      }
    });

    if (!payout) {
      throw ServerActionError.NotFound(
        'process-driver-payout.ts',
        'processDriverPayout',
        'Payout no encontrado'
      );
    }

    // Verificar que el payout esté en estado PENDING
    if (payout.status !== 'PENDING') {
      throw ServerActionError.ValidationFailed(
        'process-driver-payout.ts',
        'processDriverPayout',
        `El payout debe estar en estado PENDING para ser procesado. Estado actual: ${payout.status}`
      );
    }

    // VALIDACIÓN CRÍTICA: Verificar que el conductor tenga información bancaria verificada
    if (!payout.driver.user.bankAccount?.isVerified) {
      throw ServerActionError.ValidationFailed(
        'process-driver-payout.ts',
        'processDriverPayout',
        'El conductor no tiene información bancaria verificada. No se puede procesar el pago.'
      );
    }

    // Actualizar el payout a estado PROCESSING
    const updatedPayout = await prisma.driverPayout.update({
      where: { id: validatedData.payoutId },
      data: {
        status: 'PROCESSING',
        processedBy: session.user.id,
        processedAt: new Date(),
      }
    });

    // Notificar al conductor
    await notifyUser(
      payout.driver.userId,
      'Tu pago está siendo procesado',
      `El pago de $${payout.payoutAmount} correspondiente al viaje de ${payout.trip.originCity} a ${payout.trip.destinationCity} está siendo procesado por nuestro equipo.`,
      undefined,
      undefined
    );

    // Logging exitoso
    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_PROCESS_DRIVER_PAYOUT,
        status: 'SUCCESS',
        details: {
          payoutId: validatedData.payoutId,
          driverId: payout.driverId,
          driverName: payout.driver.user.name,
          driverEmail: payout.driver.user.email,
          payoutAmount: payout.payoutAmount,
          bankAlias: payout.driver.user.bankAccount?.bankAlias,
          route: `${payout.trip.originCity} → ${payout.trip.destinationCity}`,
        }
      },
      {
        fileName: 'process-driver-payout.ts',
        functionName: 'processDriverPayout'
      }
    );

    return ApiHandler.handleSuccess(
      updatedPayout,
      'Payout procesado exitosamente. Ahora puedes completar el pago cargando el comprobante de transferencia.'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
