'use server'

import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { resolveTicketSchema, type ResolveTicketInput } from "@/schemas/validation/support-ticket-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { notificationService } from "@/services/notifications/notification-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

/**
 * Resuelve un ticket de soporte (solo admins)
 */
export async function resolveTicket(data: ResolveTicketInput) {
  try {
    // 1. Autorización (solo admins)
    const session = await requireAuthorization('admin', 'resolve-ticket.ts', 'resolveTicket');

    // 2. Validación del schema
    const validatedData = resolveTicketSchema.parse(data);

    // 3. Verificar que el ticket existe y obtener info del usuario
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: validatedData.ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!existingTicket) {
      return ApiHandler.handleError(new Error('Ticket no encontrado'));
    }

    if (existingTicket.status === 'RESOLVED') {
      return ApiHandler.handleError(new Error('Este ticket ya está resuelto'));
    }

    // 4. Actualizar ticket en transacción
    const ticket = await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.supportTicket.update({
        where: { id: validatedData.ticketId },
        data: {
          status: 'RESOLVED',
          resolution: validatedData.resolution,
          resolvedAt: new Date(),
          assignedToAdminId: session.user.id // Auto-asignar al admin que resuelve
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return updatedTicket;
    });

    // 5. Logging de éxito
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.SUPPORT_TICKET_RESOLVED,
      status: 'SUCCESS',
      details: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        resolvedBy: session.user.id
      }
    }, { fileName: 'resolve-ticket.ts', functionName: 'resolveTicket' });

    // 6. Notificar al usuario que su ticket fue resuelto
    await notificationService.processTargetedNotification({
      title: 'Tu ticket fue resuelto',
      message: `El ticket ${ticket.ticketNumber} ha sido resuelto. Revisa la solución.`,
      link: `/support/tickets/${ticket.id}`,
      targetUserId: ticket.userId
    }, session.user.id);

    return ApiHandler.handleSuccess(
      {
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          resolution: ticket.resolution,
          resolvedAt: ticket.resolvedAt
        }
      },
      `Ticket ${ticket.ticketNumber} resuelto exitosamente`
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

/**
 * Asignar un ticket a un admin (sin resolverlo)
 */
export async function assignTicketToSelf(ticketId: string) {
  try {
    // 1. Autorización
    const session = await requireAuthorization('admin', 'resolve-ticket.ts', 'assignTicketToSelf');

    // 2. Verificar que el ticket existe
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!existingTicket) {
      return ApiHandler.handleError(new Error('Ticket no encontrado'));
    }

    // 3. Asignar ticket
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToAdminId: session.user.id
      }
    });

    return ApiHandler.handleSuccess(
      { ticket },
      'Ticket asignado exitosamente'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
