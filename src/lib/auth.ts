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
    plugins: [
        admin(),
        jwt({
            jwks: {
                keyPairConfig: {
                    alg: "RS256",  // Correcto
                    modulusLength: 2048  // Opcional, el valor predeterminado es 2048
                }
            }
        })
    ]
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;