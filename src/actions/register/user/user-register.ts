'use server'

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { CreateUserInput, userSchema } from "@/schemas";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";

export async function createUser(input: CreateUserInput) {
  try {
    const validatedData = userSchema.parse(input);
    const { userId }: { userId: string | null } = await auth()

    if (!userId) {
      throw ServerActionError.AuthenticationFailed('user-register.ts', 'createUser');
    }

    // Verificar si el email ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw ServerActionError.EmailInUse('user-register.ts', 'createUser');
    }

    // Calcular edad
    const birthDate = new Date(validatedData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Obtener términos y condiciones activos
    const activeTerms = await prisma.termsAndCondition.findFirst({
      where: { isActive: true },
      orderBy: { effectiveDate: 'desc' },
    });

    // Crear usuario y aceptación de términos en una transacción
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          clerkId: userId!,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          gender: validatedData.gender,
          birthDate: birthDate,
          age: age,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'createUser.newUser', 'user-register.ts');
      });

      await tx.userTermsAcceptance.create({
        data: {
          userId: newUser.id,
          termsId: activeTerms!.id,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'createUser.userTermsAcceptance', 'user-register.ts');
      });

      await tx.passenger.create({
        data: {
          userId: newUser.id,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'createUser.passenger', 'user-register.ts');
      });

      return newUser;
    }).catch(error => {
      throw handlePrismaError(error, 'createUser', 'user-register.ts');
    })

    return {
      success: true,
      data: {
        user,
        message: 'Usuario creado correctamente.',
      },
    };
  } catch (error) {
    throw error;
  }
}


