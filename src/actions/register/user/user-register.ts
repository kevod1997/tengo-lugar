'use server'

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";;
import { UpdateUserInput, userSchema } from "@/schemas";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";

//todo ver cuando se modifica la info del email como se manejaria
//todo ver como manejariamos lo que son los terminos aceptados, porque en en lotro caso no se deberian pedir de nuevo me parece
//todo ver como manejar campos que ya existen si eso afecta en algo como el caso del email y del teelefono si se verifico antes

export async function updateUser(input: UpdateUserInput) {
  try {
    const validatedData = userSchema.parse(input);
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw ServerActionError.AuthenticationFailed('user-register.ts', 'UpdateUser');
    }

    const birthDate = new Date(validatedData.birthDate);

    // Obtener términos y condiciones activos
    const activeTerms = await prisma.termsAndCondition.findFirst({
      where: { isActive: true },
      orderBy: { effectiveDate: 'desc' },
    });

    // Crear usuario y aceptación de términos en una transacción
    const user = await prisma.$transaction(async (tx) => {
      const updateUser = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: validatedData.firstName + ' ' + validatedData.lastName,
          phoneNumber: validatedData.phoneNumber,
          email: validatedData.email,
          gender: validatedData.gender,
          birthDate: birthDate,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'UpdateUser.newUser', 'user-register.ts');
      });



      await tx.userTermsAcceptance.create({
        data: {
          userId: updateUser.id,
          termsId: activeTerms!.id,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'UpdateUser.userTermsAcceptance', 'user-register.ts');
      });

      await tx.passenger.create({
        data: {
          userId: updateUser.id,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'UpdateUser.passenger', 'user-register.ts');
      });

      return updateUser;
    }).catch(error => {
      throw handlePrismaError(error, 'UpdateUser', 'user-register.ts');
    })

    return {
      success: true,
      data: {
        user,
        message: 'Su informacion se actualizo correctamente.',
      },
    };
  } catch (error) {
    throw error;
  }
}
