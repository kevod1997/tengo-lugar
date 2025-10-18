import { inngest } from "@/lib/inngest";
import { expireUnpaidReservations } from "@/actions/trip/expire-unpaid-reservations";

/**
 * Inngest cron job para expirar reservas APPROVED sin pago
 *
 * Se ejecuta cada 1 hora para detectar reservas que:
 * - Estado: APPROVED
 * - Payment.status: PENDING
 * - Tiempo hasta salida: < 2 horas
 *
 * Según REGLAS_DE_NEGOCIO_PAGOS.md Sección 9.3
 *
 * Frecuencia optimizada: Cada 1 hora es suficiente dado que la ventana
 * de expiración es de 2 horas, proporcionando margen de seguridad adecuado.
 */
export const expireUnpaidReservationsFunction = inngest.createFunction(
  {
    id: "expire-unpaid-reservations",
    name: "Expire Unpaid Reservations",
    concurrency: {
      limit: 1
    }
  },
  {
    cron: "0 * * * *" // Cada 1 hora (en punto)
  },
  async ({ step }) => {
    console.log("[Inngest] Starting expire-unpaid-reservations job");

    await step.run("expire-unpaid-reservations", async () => {
      const result = await expireUnpaidReservations();

      if (result.success) {
        console.log(`[Inngest] Expired ${result.data?.expiredCount || 0} unpaid reservations`);
      } else {
        console.error("[Inngest] Error expiring unpaid reservations:", result.message);
      }

      return result;
    });

    return { message: "Expire unpaid reservations job completed" };
  }
);
