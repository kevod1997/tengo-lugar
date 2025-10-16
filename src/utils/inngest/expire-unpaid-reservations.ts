import { inngest } from "@/lib/inngest";
import { expireUnpaidReservations } from "@/actions/trip/expire-unpaid-reservations";

/**
 * Inngest cron job para expirar reservas APPROVED sin pago
 *
 * Se ejecuta cada 30 minutos para detectar reservas que:
 * - Estado: APPROVED
 * - Payment.status: PENDING
 * - Tiempo hasta salida: < 2 horas
 *
 * Según REGLAS_DE_NEGOCIO_PAGOS.md Sección 9.3
 */
export const expireUnpaidReservationsFunction = inngest.createFunction(
  {
    id: "expire-unpaid-reservations",
    name: "Expire Unpaid Reservations"
  },
  {
    cron: "*/30 * * * *" // Cada 30 minutos
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
