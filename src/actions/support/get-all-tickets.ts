'use server'

import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { TicketStatus, TicketCategory, Prisma } from "@prisma/client";

interface GetAllTicketsFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  assignedToMe?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Obtiene todos los tickets de soporte (solo admins)
 * Con filtros opcionales y paginación
 */
export async function getAllTickets(filters?: GetAllTicketsFilters) {
  try {
    // 1. Autorización (solo admins)
    const session = await requireAuthorization('admin', 'get-all-tickets.ts', 'getAllTickets');

    // 2. Valores por defecto de paginación
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // 3. Construir filtros
    const where: Prisma.SupportTicketWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.assignedToMe) {
      where.assignedToAdminId = session.user.id;
    }

    // Búsqueda por ticketNumber, subject o nombre de usuario
    if (filters?.search && filters.search.trim() !== '') {
      where.OR = [
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    // 4. Obtener total de tickets (para paginación)
    const totalTickets = await prisma.supportTicket.count({ where });

    // 5. Obtener tickets paginados con información del usuario
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
      ],
      skip,
      take: pageSize
    });

    // 6. Calcular métricas globales (sin filtros de paginación)
    const metricsWhere: Prisma.SupportTicketWhereInput = {};
    if (filters?.assignedToMe) {
      metricsWhere.assignedToAdminId = session.user.id;
    }

    const [totalCount, openCount, resolvedCount, assignedToMeCount] = await Promise.all([
      prisma.supportTicket.count({ where: metricsWhere }),
      prisma.supportTicket.count({ where: { ...metricsWhere, status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { ...metricsWhere, status: 'RESOLVED' } }),
      prisma.supportTicket.count({ where: { assignedToAdminId: session.user.id } })
    ]);

    // 7. Calcular metadata de paginación
    const totalPages = Math.ceil(totalTickets / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return ApiHandler.handleSuccess({
      tickets,
      metrics: {
        total: totalCount,
        open: openCount,
        resolved: resolvedCount,
        assignedToMe: assignedToMeCount
      },
      pagination: {
        page,
        pageSize,
        totalItems: totalTickets,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
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
    await requireAuthorization('admin', 'get-all-tickets.ts', 'getTicketDetailAdmin');



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
