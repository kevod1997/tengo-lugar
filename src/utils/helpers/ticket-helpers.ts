import prisma from "@/lib/prisma";

/**
 * Genera un número de ticket único secuencial
 * Formato: TKT-00001, TKT-00002, etc.
 */
export async function generateTicketNumber(): Promise<string> {
  // Obtener el último ticket creado
  const lastTicket = await prisma.supportTicket.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { ticketNumber: true }
  });

  // Extraer el número del último ticket o empezar desde 0
  const lastNumber = lastTicket
    ? parseInt(lastTicket.ticketNumber.split('-')[1])
    : 0;

  // Incrementar y formatear con padding de 5 dígitos
  const newNumber = (lastNumber + 1).toString().padStart(5, '0');

  return `TKT-${newNumber}`;
}

/**
 * Genera un link de WhatsApp para contactar al usuario sobre un ticket
 * @param phoneNumber - Número de teléfono del usuario (con código de país)
 * @param ticketNumber - Número del ticket (TKT-XXXXX)
 * @param userName - Nombre del usuario
 * @returns URL de WhatsApp con mensaje pre-rellenado
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  ticketNumber: string,
  userName: string
): string {
  // Limpiar el número de teléfono (solo dígitos)
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  // Mensaje pre-rellenado para el admin
  const message = `Hola ${userName}, te contacto por tu ticket ${ticketNumber}. ¿Cómo puedo ayudarte?`;

  // Generar link de WhatsApp
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
