import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, jwt } from "better-auth/plugins"
import prisma from "./prisma";
import { EmailService } from "@/services/email/email-service";

const emailService = new EmailService(process.env.BREVO_API_KEY!);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    // BUG: Prob a bug with updateAge method. It throws an error - Argument `where` of type SessionWhereUniqueInput needs at least one of `id` arguments. 
    // As a workaround, set updateAge to a large value for now.
    updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url },) => {
      emailService.sendEmail(
        user.email,
        'Restablecer contraseña',
        `Haz click en el siguiente enlace para restablecer tu contraseña: <a href="${url}">${url}</a>`
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      // Add the token to the callback URL to ensure it's available when redirected
      const encodedToken = encodeURIComponent(token);
      const callbackWithTokenAndUserId = `${process.env.EMAIL_VERIFICATION_CALLBACK_URL}?token=${encodedToken}?userId=${user.id}`;

      const verificationUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:3000'}/api/auth/verify-email?token=${encodedToken}&callbackURL=${encodeURIComponent(callbackWithTokenAndUserId)}`;

      await emailService.sendEmail(
        user.email,
        'Verifica tu email',
        `Haz click en el siguiente enlace para verificar tu email: <a href="${verificationUrl}">${verificationUrl}</a>`
      );
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      birthDate: {
        type: "date",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      profileImageKey: {
        type: "string",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
    }
  },
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'https://localhost:3000',
  plugins: [
    admin(),
    jwt({
      jwt: {
        expirationTime: "1d",
        definePayload: async ({ user }) => {
          // Obtener usuario con sus relaciones
          const userWithRelations = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              driver: true,
              passenger: true
            }
          });

          let tripRole = null;
          let roleId = null;
          const actualTime = new Date();
          const driverId = userWithRelations?.driver?.id;
          const passengerId = userWithRelations?.passenger?.id;

          // Variables temporales para comparación
          let lastDriverTripDate = null;
          let lastPassengerTripDate = null;
          let lastDriverCarId = null;
          let lastPassengerTripId = null;

          // Verificar si el usuario tiene cuenta de conductor
          if (driverId) {
            const lastDriverTrip = await prisma.trip.findFirst({
              where: {
                status: 'ACTIVE',
                driverCar: {
                  driverId: driverId
                }
              },
              orderBy: { createdAt: 'desc' },
              select: {
                status: true,
                driverCarId: true,
                createdAt: true
              }
            });

            if (lastDriverTrip && lastDriverTrip.createdAt < actualTime) {
              lastDriverTripDate = lastDriverTrip.createdAt;
              lastDriverCarId = lastDriverTrip.driverCarId;
            }
          }

          // Verificar si el usuario tiene cuenta de pasajero con reserva APROBADA
          if (passengerId) {
            const lastPassengerTrip = await prisma.tripPassenger.findFirst({
              where: {
                passengerId: passengerId,
                reservationStatus: 'APPROVED'  // Solo considerar reservas aprobadas
              },
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                createdAt: true
              }
            });

            if (lastPassengerTrip && lastPassengerTrip.createdAt < actualTime) {
              lastPassengerTripDate = lastPassengerTrip.createdAt;
              lastPassengerTripId = lastPassengerTrip.id;
            }
          }

          // Payload base que siempre tendrá el ID del usuario y su rol del sistema
          const payload = {
            id: user.id,
            role: user.role
          };

          // Determinar el rol más reciente
          if (lastDriverTripDate && lastPassengerTripDate) {
            // Si tiene ambos roles, elegir el más reciente
            if (lastDriverTripDate > lastPassengerTripDate) {
              tripRole = 'driver';
              roleId = lastDriverCarId;
            } else {
              tripRole = 'passenger';
              roleId = lastPassengerTripId;
            }
          } else if (lastDriverTripDate) {
            // Solo tiene rol de conductor
            tripRole = 'driver';
            roleId = lastDriverCarId;
          } else if (lastPassengerTripDate) {
            // Solo tiene rol de pasajero
            tripRole = 'passenger';
            roleId = lastPassengerTripId;
          }

          // Solo agregar tripRole y roleId si efectivamente tiene uno de esos roles
          if (tripRole) {
            return {
              ...payload,
              name: user.name,
              tripRole,
              roleId
            };
          }

          // Si no tiene ningún rol específico, devolver solo el payload base
          return payload;
        }
      },
      jwks: {
        keyPairConfig: {
          alg: "RS256",
          modulusLength: 2048
        }
      }
    })
  ]
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;