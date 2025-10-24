'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { ServerActionError } from "@/lib/exceptions/server-action-error";

/**
 * Verifica una cuenta bancaria
 * Solo admins pueden ejecutar esta acción
 */
export async function verifyBankAccount(bankAccountId: string) {
  try {
    // 1. Autenticación y autorización
    const session = await requireAuthorization('admin', 'verify-bank-account.ts', 'verifyBankAccount');

    if (!bankAccountId) {
      throw ServerActionError.ValidationFailed(
        'verify-bank-account.ts',
        'verifyBankAccount',
        'ID de cuenta bancaria es requerido'
      );
    }

    // 2. Verificar que la cuenta existe
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
      select: {
        id: true,
        isVerified: true,
        bankAlias: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!existingAccount) {
      throw ServerActionError.NotFound(
        'verify-bank-account.ts',
        'verifyBankAccount',
        'Cuenta bancaria no encontrada'
      );
    }

    // 3. Verificar que no esté ya verificada
    if (existingAccount.isVerified) {
      throw ServerActionError.ValidationFailed(
        'verify-bank-account.ts',
        'verifyBankAccount',
        'Esta cuenta bancaria ya está verificada'
      );
    }

    // 4. Actualizar cuenta bancaria
    const verifiedAccount = await prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: session.user.id
      },
      select: {
        id: true,
        bankAlias: true,
        accountOwner: true,
        isVerified: true,
        verifiedAt: true,
        verifiedBy: true
      }
    });

    // 5. Logging exitoso
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.ADMIN_VERIFY_BANK_ACCOUNT,
      status: 'SUCCESS',
      details: {
        bankAccountId,
        bankAlias: existingAccount.bankAlias,
        userId: existingAccount.user.id,
        userName: existingAccount.user.name,
        userEmail: existingAccount.user.email
      }
    }, { fileName: 'verify-bank-account.ts', functionName: 'verifyBankAccount' });

    // 6. Respuesta estructurada
    return ApiHandler.handleSuccess(
      verifiedAccount,
      `Cuenta bancaria verificada exitosamente`
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
