'use server'

import prisma from "@/lib/prisma";
import { userSchema, CreateUserInput } from "@/lib/validations/user-validation";
import { ApplicationError } from "@/lib/exceptions";
import { auth } from "@clerk/nextjs/server";
import { formatUserResponse } from "@/lib/user-formatter";

export async function createUser(input: CreateUserInput) {
  try {
    const validatedData = userSchema.parse(input);
    const { userId }: { userId: string | null } = await auth()
    console.log('userId', userId)

    if (!userId) {
      throw new ApplicationError('Usuario no autenticado', 401);
    }

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
          clerkId: userId!,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          gender: validatedData.gender,
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

      await tx.passenger.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    // revalidatePath('/users'); // Ajusta según tu estructura de rutas

    return {
      success: true,
      message: 'Usuario creado exitosamente',
      data: user,
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

export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        identityCard: true,
        termsAcceptance: {
          orderBy: { acceptedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      return null
    }

    return formatUserResponse(user)

  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error)
    throw error
  }
}
