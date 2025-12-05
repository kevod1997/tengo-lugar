'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import type { BankAccountFormData } from "@/schemas/validation/bank-account-schema";
import { bankAccountSchema } from "@/schemas/validation/bank-account-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthentication } from "@/utils/helpers/auth-helper";

/**
 * Obtiene la cuenta bancaria del usuario autenticado
 */
export async function getBankAccount() {
  try {
    const session = await requireAuthentication('bank-account.ts', 'getBankAccount');

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        bankAlias: true,
        isVerified: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return ApiHandler.handleSuccess(bankAccount, 'Cuenta bancaria obtenida exitosamente');

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

/**
 * Crea o actualiza el alias bancario del usuario
 * Requiere que el usuario tenga un número de teléfono registrado
 * El titular de la cuenta se toma automáticamente del nombre del usuario
 */
export async function createOrUpdateBankAlias(data: BankAccountFormData) {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('bank-account.ts', 'createOrUpdateBankAlias');

    // 2. Validar que el usuario tenga número de teléfono y obtener su nombre
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        phoneNumber: true,
        name: true
      }
    });

    if (!user?.phoneNumber) {
      throw ServerActionError.ValidationFailed(
        'bank-account.ts',
        'createOrUpdateBankAlias',
        'Debes tener un número de teléfono registrado para agregar datos bancarios'
      );
    }

    // 3. Validación con Zod
    const validatedData = bankAccountSchema.parse(data);

    // 4. Verificar si ya existe una cuenta bancaria
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const isUpdate = !!existingAccount;

    // 5. Crear o actualizar en transacción
    const result = await prisma.$transaction(async (tx) => {
      if (isUpdate) {
        // Actualizar cuenta existente y resetear verificación
        return await tx.bankAccount.update({
          where: { userId: session.user.id },
          data: {
            bankAlias: validatedData.bankAlias,
            accountOwner: user.name, // Usar nombre del usuario
            isVerified: false, // Reset verification on edit
            verifiedAt: null,
            verifiedBy: null,
          },
          select: {
            id: true,
            bankAlias: true,
            isVerified: true,
            verifiedAt: true,
          }
        });
      } else {
        // Crear nueva cuenta bancaria
        return await tx.bankAccount.create({
          data: {
            userId: session.user.id,
            bankAlias: validatedData.bankAlias,
            accountOwner: user.name, // Usar nombre del usuario
            isVerified: false,
          },
          select: {
            id: true,
            bankAlias: true,
            isVerified: true,
            verifiedAt: true,
          }
        });
      }
    });

    // 6. Logging exitoso
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: isUpdate ? TipoAccionUsuario.ACTUALIZAR_CUENTA_BANCARIA : TipoAccionUsuario.CREAR_CUENTA_BANCARIA,
      status: 'SUCCESS',
      details: {
        bankAlias: validatedData.bankAlias,
        accountOwner: user.name,
        isUpdate,
      }
    }, { fileName: 'bank-account.ts', functionName: 'createOrUpdateBankAlias' });

    // 7. Respuesta estructurada
    return ApiHandler.handleSuccess(
      result,
      isUpdate
        ? 'Alias bancario actualizado. Pendiente de verificación.'
        : 'Alias bancario creado exitosamente. Pendiente de verificación.'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
