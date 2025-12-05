import { sendSystemNotification } from "@/actions/notifications/send-system-notification";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { EmailService } from "@/services/email/email-service";
import { logError, logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

const emailService = new EmailService(process.env.RESEND_API_KEY!);

export const sendPaymentVerifiedNotifications = inngest.createFunction(
  {
    id: "send-payment-verified-notifications",
    retries: 5
  },
  { event: "payment-verified-notification" },
  async ({ event, step }) => {
    const { paymentId, amount, senderName } = event.data;

    console.log(`[Inngest] Processing payment verification notifications for payment ${paymentId}`);

    try {
      // Step 1: Fetch complete payment data with related entities
      const paymentData = await step.run("fetch-payment-data", async () => {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: {
            tripPassenger: {
              include: {
                passenger: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                },
                trip: {
                  select: {
                    id: true,
                    originCity: true,
                    destinationCity: true,
                    date: true,
                    departureTime: true,
                    driverCar: {
                      include: {
                        driver: {
                          include: {
                            user: {
                              select: {
                                id: true,
                                name: true,
                                email: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (!payment) {
          throw new Error(`Payment ${paymentId} not found`);
        }

        // Verify payment is in COMPLETED status (already updated by server.js)
        if (payment.status !== 'COMPLETED') {
          console.log(`[Inngest] Payment ${paymentId} is not in COMPLETED status (${payment.status}), skipping notifications`);
          return null;
        }

        return payment;
      });

      // If payment not found or not completed, skip notifications
      if (!paymentData) {
        return {
          success: false,
          message: `Payment ${paymentId} not found or not in COMPLETED status`,
          paymentId
        };
      }

      const passenger = paymentData.tripPassenger.passenger;
      const trip = paymentData.tripPassenger.trip;
      const driver = trip.driverCar.driver;

      console.log(`[Inngest] Payment data fetched - Passenger: ${passenger.user.name}, Driver: ${driver.user.name}, Trip: ${trip.originCity} -> ${trip.destinationCity}`);

      // Step 2: Send WebSocket notification to passenger
      await step.run("notify-passenger-websocket", async () => {
        const result = await sendSystemNotification(
          passenger.userId,
          '¡Pago verificado!',
          `Tu pago de $${amount.toFixed(2)} para el viaje de ${trip.originCity} a ${trip.destinationCity} ha sido verificado automáticamente. ¡Estás confirmado para viajar!`,
          'payment_approved',
          `/viajes/${trip.id}`,
          {
            paymentId,
            tripId: trip.id,
            amount,
            senderName
          }
        );

        if (!result.success) {
          throw new Error(`Failed to send notification to passenger: ${result.error?.message || 'Unknown error'}`);
        }

        console.log(`[Inngest] WebSocket notification sent to passenger ${passenger.user.name}`);

        return { success: true };
      });

      // Step 3: Send WebSocket notification to driver
      await step.run("notify-driver-websocket", async () => {
        const result = await sendSystemNotification(
          driver.userId,
          'Nuevo pasajero confirmado',
          `${passenger.user.name} confirmó su pago de $${amount.toFixed(2)} para tu viaje de ${trip.originCity} a ${trip.destinationCity}`,
          'payment_approved',
          `/conductor/viajes/${trip.id}`,
          {
            paymentId,
            tripId: trip.id,
            passengerId: passenger.userId,
            passengerName: passenger.user.name,
            amount,
            seatsReserved: paymentData.tripPassenger.seatsReserved
          }
        );

        if (!result.success) {
          throw new Error(`Failed to send notification to driver: ${result.error?.message || 'Unknown error'}`);
        }

        console.log(`[Inngest] WebSocket notification sent to driver ${driver.user.name}`);

        return { success: true };
      });

      // Step 4: Send email to passenger
      await step.run("send-passenger-email", async () => {
        const tripDate = new Date(trip.date);
        const tripTime = new Date(trip.departureTime);

        await emailService.sendPaymentVerifiedEmailToPassenger({
          to: passenger.user.email,
          passengerName: passenger.user.name || 'Pasajero',
          amount,
          tripOrigin: trip.originCity,
          tripDestination: trip.destinationCity,
          departureDate: tripDate.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          departureTime: tripTime.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          seatsReserved: paymentData.tripPassenger.seatsReserved,
          tripUrl: `${process.env.NEXT_PUBLIC_CLIENT_URL || 'https://tengolugar.store'}/viajes/${trip.id}`,
        });

        console.log(`[Inngest] Email sent to passenger ${passenger.user.email}`);

        return { success: true };
      });

      // Add delay to avoid bulk sending pattern (improves email deliverability)
      await step.sleep("delay-before-driver-email", "45s");

      // Step 5: Send email to driver
      await step.run("send-driver-email", async () => {
        const tripDate = new Date(trip.date);
        const tripTime = new Date(trip.departureTime);

        await emailService.sendPaymentVerifiedEmailToDriver({
          to: driver.user.email,
          driverName: driver.user.name || 'Conductor',
          passengerName: passenger.user.name || 'Un pasajero',
          amount,
          tripOrigin: trip.originCity,
          tripDestination: trip.destinationCity,
          departureDate: tripDate.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          departureTime: tripTime.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          seatsReserved: paymentData.tripPassenger.seatsReserved,
          tripUrl: `${process.env.NEXT_PUBLIC_CLIENT_URL || 'https://tengolugar.store'}/conductor/viajes/${trip.id}`,
        });

        console.log(`[Inngest] Email sent to driver ${driver.user.email}`);

        return { success: true };
      });

      // Step 6: Log successful notifications
      await step.run("log-notification-success", async () => {
        // Log the action with passenger userId (the payment was made by the passenger)
        await logActionWithErrorHandling(
          {
            userId: passenger.userId,
            action: TipoAccionUsuario.PAGO_COMPLETADO,
            status: 'SUCCESS',
            details: {
              paymentId,
              tripId: trip.id,
              passengerId: passenger.userId,
              driverId: driver.userId,
              amount,
              senderName,
              notificationsSent: {
                passengerWebSocket: true,
                driverWebSocket: true,
                passengerEmail: true,
                driverEmail: true
              }
            }
          },
          {
            fileName: 'send-payment-verified-notifications.ts',
            functionName: 'sendPaymentVerifiedNotifications'
          }
        );

        return { success: true };
      });

      console.log(`[Inngest] All notifications sent successfully for payment ${paymentId}`);

      return {
        success: true,
        message: `Payment verification notifications sent successfully`,
        paymentId,
        tripId: trip.id,
        passengerEmail: passenger.user.email,
        driverEmail: driver.user.email
      };

    } catch (error) {
      await logError({
        origin: 'Inngest Background Job - Payment Verified Notifications',
        code: 'PAYMENT_VERIFIED_NOTIFICATION_ERROR',
        message: `Failed to send payment verification notifications for payment ${paymentId}`,
        details: error instanceof Error ? error.message : 'Unknown error',
        fileName: 'send-payment-verified-notifications.ts',
        functionName: 'sendPaymentVerifiedNotifications'
      });

      console.error(`[Inngest] Error processing payment ${paymentId}:`, error);

      throw error; // Re-throw for Inngest retry logic
    }
  }
);
