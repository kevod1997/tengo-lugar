// src/actions/profile/update-password.ts
'use server'

import { headers } from "next/headers";

import { z } from "zod";

import { ApiHandler } from "@/lib/api-handler";
import { auth } from "@/lib/auth";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { LoggingService } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(32, "La nueva contraseña no puede exceder 32 caracteres"),
  confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export async function updatePassword(data: {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}) {
  try {
    // Validate input data
    const validatedData = passwordUpdateSchema.parse(data);

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('update-password.ts', 'updatePassword');
    }

    // Using Better Auth's changePassword function through its API
    // (Since we can't directly call client methods in a server action)
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword,
        revokeOtherSessions: false // No revocamos otras sesiones por defecto
      }
    });

    // If we've reached this point without exception, the operation was successful

    // Log the successful password change
    await LoggingService.logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ACTUALIZACION_CONTRASENA,
        status: 'SUCCESS',
      },
      {
        fileName: 'update-password.ts',
        functionName: 'updatePassword'
      }
    );

    return ApiHandler.handleSuccess(
      undefined,
      'Contraseña actualizada exitosamente'
    );

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw ServerActionError.ValidationFailed(
        'update-password.ts',
        'updatePassword',
        errorMessage
      );
    }

    // Log failed attempt if session is available
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session) {
        await LoggingService.logActionWithErrorHandling(
          {
            userId: session.user.id,
            action: TipoAccionUsuario.ACTUALIZACION_CONTRASENA,
            status: 'FAILED',
            details: { error: (error instanceof Error) ? error.message : String(error) }
          },
          {
            fileName: 'update-password.ts',
            functionName: 'updatePassword'
          }
        );
      }
    } catch (logError) {
      // Si falla el logging, continuamos
      console.error("Error logging password change failure:", logError);
    }

    // Determine appropriate error message
    let errorMessage = "Ha ocurrido un error al actualizar la contraseña";

    if (error instanceof Error) {
      // Interceptar mensaje de error específico de Better Auth
      if (error.message.includes("incorrect password") ||
        error.message.includes("contraseña incorrecta") ||
        error.message.toLowerCase().includes("invalid") ||
        error.message.toLowerCase().includes("inválid")) {
        errorMessage = "La contraseña actual es incorrecta";
      } else {
        errorMessage = error.message;
      }
    }

    return ApiHandler.handleError(
      ServerActionError.ValidationFailed(
        'update-password.ts',
        'updatePassword',
        errorMessage
      )
    );
  }
}

// Para usuarios con cuentas sociales que quieren añadir contraseña
export async function setPasswordForSocialAccount(data: {
  newPassword: string,
  confirmPassword: string
}) {
  try {
    // Schema for validation
    const schema = z.object({
      newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(32, "La contraseña no puede exceder 32 caracteres"),
      confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida")
    }).refine(data => data.newPassword === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"]
    });

    const validatedData = schema.parse(data);

    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('update-password.ts', 'setPasswordForSocialAccount');
    }

    // Using Better Auth's setPassword API
    // This is a server-only function that can set a password on an account
    // that doesn't have one (social login accounts)
    await auth.api.setPassword({
      headers: await headers(), // Pass current headers with session info
      body: {
        newPassword: validatedData.newPassword
      }
    });

    // Log successful operation
    await LoggingService.logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ACTUALIZACION_CONTRASENA,
        status: 'SUCCESS',
      },
      {
        fileName: 'update-password.ts',
        functionName: 'setPasswordForSocialAccount'
      }
    );

    return ApiHandler.handleSuccess(
      undefined,
      'Método de acceso por correo/contraseña añadido exitosamente'
    );

  } catch (error) {
    return ApiHandler.handleError(error instanceof Error
      ? ServerActionError.ValidationFailed(
        'update-password.ts',
        'setPasswordForSocialAccount',
        error.message
      )
      : error
    );
  }
}