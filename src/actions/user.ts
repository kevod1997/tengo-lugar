
'use server'

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { userSchema, CreateUserInput } from "@/lib/validations/user-validation";
import { ApplicationError } from "@/lib/exceptions";

export async function createUser(input: CreateUserInput) {
  try {
    const validatedData = userSchema.parse(input);

    // Verificar si el email ya está registrado
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new ApplicationError('El email ya está registrado', 400);
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

    if (!activeTerms) {
      throw new ApplicationError('No hay términos y condiciones activos', 400);
    }

    // Crear usuario y aceptación de términos en una transacción
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          birthDate: birthDate,
          age: age,
        },
      });

      await tx.userTermsAcceptance.create({
        data: {
          userId: newUser.id,
          termsId: activeTerms.id,
        },
      });

      return newUser;
    });

    revalidatePath('/users'); // Ajusta según tu estructura de rutas
    
    return {
      success: true,
      data: { userId: user.id },
    };

  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Error desconocido al crear el usuario',
    };
  }
}

