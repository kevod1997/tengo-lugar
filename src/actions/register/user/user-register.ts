'use server'

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";;
import { UpdateUserInput, userSchema } from "@/schemas";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";


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

export async function updateUserProfile(input: UpdateUserInput) {
  try {
    const validatedData = userSchema.parse(input);
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw ServerActionError.AuthenticationFailed('user-register.ts', 'updateUserProfile');
    }

    const birthDate = new Date(validatedData.birthDate);

    // Get the current user data to check if we need to create a passenger record
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { passenger: true }
    });

    if (!currentUser) {
      throw ServerActionError.UserNotFound('uuser-register.ts', 'updateUserProfile');
    }
    // Update user in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Update user information
      const updatedUser = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: validatedData.firstName + ' ' + validatedData.lastName,
          phoneNumber: validatedData.phoneNumber,
          phoneNumberVerified: validatedData.phoneNumberVerified,
          gender: validatedData.gender,
          birthDate: birthDate,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'updateUserProfile.updateUser', 'update-profile.ts');
      });

      // Create passenger record if it doesn't exist
      if (!currentUser.passenger) {
        await tx.passenger.create({
          data: {
            userId: updatedUser.id,
          },
        }).catch(error => {
          throw handlePrismaError(error, 'updateUserProfile.createPassenger', 'user-register.ts');
        });
      }

      return updatedUser;
    }).catch(error => {
      throw handlePrismaError(error, 'updateUserProfile', 'user-register.ts');
    })

    return {
      success: true,
      data: {
        user,
        message: 'Su información se actualizó correctamente.',
      },
    };
  } catch (error) {
    throw error;
  }
}
