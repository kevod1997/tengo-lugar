'use server'

import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireAuthentication } from "@/utils/helpers/auth-helper";

/**
 * Obtiene todos los tickets de soporte del usuario autenticado
 */
export async function getUserTickets() {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('get-user-tickets.ts', 'getUserTickets');

    // 2. Obtener tickets del usuario
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        ticketNumber: true,
        category: true,
        subject: true,
        description: true,
        status: true,
        resolution: true,
        createdAt: true,
        resolvedAt: true,
        assignedAdmin: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return ApiHandler.handleSuccess({
      tickets,
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length
    });

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

/**
 * Obtiene el detalle de un ticket específico del usuario
 */
export async function getUserTicketDetail(ticketId: string) {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('get-user-tickets.ts', 'getUserTicketDetail');

    // 2. Obtener ticket (verificando que pertenezca al usuario)
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId: session.user.id // Importante: solo puede ver sus propios tickets
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!ticket) {
      return ApiHandler.handleError(
        new Error('Ticket no encontrado o no tienes permiso para verlo')
      );
    }

    return ApiHandler.handleSuccess({ ticket });

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
