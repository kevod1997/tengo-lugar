'use server'

import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { TicketStatus, TicketCategory } from "@prisma/client";

interface GetAllTicketsFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  assignedToMe?: boolean;
}

/**
 * Obtiene todos los tickets de soporte (solo admins)
 * Con filtros opcionales
 */
export async function getAllTickets(filters?: GetAllTicketsFilters) {
  try {
    // 1. Autorización (solo admins)
    const session = await requireAuthorization('admin', 'get-all-tickets.ts', 'getAllTickets');

    // 2. Construir filtros
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.assignedToMe) {
      where.assignedToAdminId = session.user.id;
    }

    // 3. Obtener tickets con información del usuario
    const tickets = await prisma.supportTicket.findMany({
      where,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true, // Importante para contactar vía WhatsApp
            phoneNumberVerified: true
          }
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // OPEN primero
        { createdAt: 'desc' } // Más recientes primero
      ]
    });

    // 4. Calcular métricas
    const metrics = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      assignedToMe: tickets.filter(t => t.assignedAdmin?.id === session.user.id).length
    };

    return ApiHandler.handleSuccess({
      tickets,
      metrics
    });

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

/**
 * Obtiene el detalle completo de un ticket (admin)
 */
export async function getTicketDetailAdmin(ticketId: string) {
  try {
    // 1. Autorización
    const session = await requireAuthorization('admin', 'get-all-tickets.ts', 'getTicketDetailAdmin');

    // 2. Obtener ticket completo
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            phoneNumberVerified: true
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
      return ApiHandler.handleError(new Error('Ticket no encontrado'));
    }

    return ApiHandler.handleSuccess({ ticket });

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
