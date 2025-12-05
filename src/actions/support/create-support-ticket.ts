'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { createTicketSchema, type CreateTicketInput } from "@/schemas/validation/support-ticket-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { notificationService } from "@/services/notifications/notification-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { generateTicketNumber } from "@/utils/helpers/ticket-helpers";

/**
 * Crea un ticket de soporte
 * Requiere que el usuario tenga teléfono verificado
 */
export async function createSupportTicket(data: CreateTicketInput) {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('create-support-ticket.ts', 'createSupportTicket');

    // 2. Validación del schema
    const validatedData = createTicketSchema.parse(data);

    // 3. Verificar que el usuario tenga teléfono verificado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        phoneNumber: true,
        phoneNumberVerified: true,
        name: true
      }
    });

    if (!user?.phoneNumberVerified || !user.phoneNumber) {
      throw ServerActionError.ValidationFailed(
        'create-support-ticket.ts',
        'createSupportTicket',
        'Debes verificar tu número de teléfono antes de crear un ticket de soporte'
      );
    }

    // 4. Generar número de ticket único
    const ticketNumber = await generateTicketNumber();

    // 5. Crear ticket en transacción
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.supportTicket.create({
        data: {
          ticketNumber,
          userId: session.user.id,
          category: validatedData.category,
          subject: validatedData.subject,
          description: validatedData.description,
          status: 'OPEN'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      });

      return newTicket;
    });

    // 6. Logging de éxito
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.SUPPORT_TICKET_CREATED,
      status: 'SUCCESS',
      details: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        category: ticket.category
      }
    }, { fileName: 'create-support-ticket.ts', functionName: 'createSupportTicket' });

    // 7. Notificar al usuario
    await notificationService.processTargetedNotification({
      title: 'Ticket de soporte creado',
      message: `Tu ticket ${ticketNumber} fue creado exitosamente. Te contactaremos pronto.`,
      link: `/support/tickets/${ticket.id}`,
      targetUserId: session.user.id
    }, session.user.id);

    // 8. Notificar a admins (para que sepan que hay un nuevo ticket)
    await notificationService.processTargetedNotification({
      title: 'Nuevo ticket de soporte',
      message: `${user.name} creó el ticket ${ticketNumber}: ${validatedData.subject}`,
      link: `/admin/support/tickets/${ticket.id}`,
      targetRole: 'admin'
    }, session.user.id);

    return ApiHandler.handleSuccess(
      {
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          category: ticket.category,
          subject: ticket.subject,
          status: ticket.status,
          createdAt: ticket.createdAt
        }
      },
      `Ticket ${ticketNumber} creado exitosamente`
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
