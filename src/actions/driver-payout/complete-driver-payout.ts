// src/actions/driver-payout/complete-driver-payout.ts
'use server'

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { completeDriverPayoutSchema } from "@/schemas/validation/driver-payout-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { notifyUser } from "@/utils/notifications/notification-helpers";


/**
 * Completa un payout de conductor (cambia estado de PROCESSING a COMPLETED)
 *
 * Validaciones:
 * - Payout debe existir y estar en estado PROCESSING
 * - Comprobante de transferencia debe estar subido (proofFileKey)
 * - Fecha de transferencia es requerida
 * - Solo admins pueden ejecutar esta acción
 *
 * @param payoutId - ID del payout a completar
 * @param proofFileKey - S3 key del comprobante de transferencia
 * @param transferDate - Fecha de la transferencia
 * @param transferNotes - Notas opcionales sobre la transferencia
 * @returns Payout completado
 */
export async function completeDriverPayout(
  payoutId: string,
  proofFileKey: string,
  transferDate: Date,
  transferNotes?: string
) {
  try {
    const session = await requireAuthorization('admin', 'complete-driver-payout.ts', 'completeDriverPayout');

    // Validar input
    const validatedData = completeDriverPayoutSchema.parse({
      payoutId,
      proofFileKey,
      transferDate,
      transferredBy: session.user.id,
      transferNotes,
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
        'complete-driver-payout.ts',
        'completeDriverPayout',
        'Payout no encontrado'
      );
    }

    // Verificar que el payout esté en estado PROCESSING
    if (payout.status !== 'PROCESSING') {
      throw ServerActionError.ValidationFailed(
        'complete-driver-payout.ts',
        'completeDriverPayout',
        `El payout debe estar en estado PROCESSING para ser completado. Estado actual: ${payout.status}`
      );
    }

    // Actualizar el payout a estado COMPLETED
    const updatedPayout = await prisma.driverPayout.update({
      where: { id: validatedData.payoutId },
      data: {
        status: 'COMPLETED',
        proofFileKey: validatedData.proofFileKey,
        transferDate: validatedData.transferDate,
        transferredBy: session.user.id,
        transferNotes: validatedData.transferNotes,
        completedAt: new Date(),
      }
    });

    // Notificar al conductor
    const formattedDate = format(validatedData.transferDate, "d 'de' MMMM, yyyy", { locale: es });

    await notifyUser(
      payout.driver.userId,
      '¡Tu pago ha sido completado!',
      `El pago de $${payout.payoutAmount} correspondiente al viaje de ${payout.trip.originCity} a ${payout.trip.destinationCity} ha sido transferido el ${formattedDate}. El comprobante está disponible en tu perfil.`,
      undefined,
      undefined
    );

    // Logging exitoso
    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_COMPLETE_DRIVER_PAYOUT,
        status: 'SUCCESS',
        details: {
          payoutId: validatedData.payoutId,
          driverId: payout.driverId,
          driverName: payout.driver.user.name,
          driverEmail: payout.driver.user.email,
          payoutAmount: payout.payoutAmount,
          transferDate: validatedData.transferDate,
          proofFileKey: validatedData.proofFileKey,
          transferNotes: validatedData.transferNotes,
          route: `${payout.trip.originCity} → ${payout.trip.destinationCity}`,
        }
      },
      {
        fileName: 'complete-driver-payout.ts',
        functionName: 'completeDriverPayout'
      }
    );

    return ApiHandler.handleSuccess(
      updatedPayout,
      'Payout completado exitosamente. El conductor ha sido notificado.'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
