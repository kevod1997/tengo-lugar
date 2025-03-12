'use server'

import { IdentityCardInput, serverIdentityCardSchema } from "@/schemas";
import { FileType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";;
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import { uploadDocuments } from "@/lib/file/upload-documents";
import { getUserById } from "./get-user";
import { splitFullName } from "@/utils/format/user-formatter";

export async function uploadIdentityCard(
  userId: string,
  input: IdentityCardInput,
) {
  try {
    const validatedData = serverIdentityCardSchema.parse(input);

    const session = await auth.api.getSession({
      headers: await headers(),
    })
  
      if (!session) {
        throw ServerActionError.AuthenticationFailed('identity-card.ts', 'uploadIdentityCard');
      }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { identityCard: true },
    });

    if (!user) {
      throw ServerActionError.UserNotFound('identity-card.ts', 'uploadIdentityCard');
    }

    const {firstName, lastName} = splitFullName(user.name);

    const userInfo = {
      id: user.id,
      firstName,
      lastName
    };

    // Verificar si ya existe una entrada de identityCard
    const existingIdentityCard = user.identityCard;

    // Si ya existe una verificación pendiente o verificada, no permitir cambios
    if (existingIdentityCard?.status === 'VERIFIED' || existingIdentityCard?.status === 'PENDING') {
      throw ServerActionError.DocumentAlreadyUploaded('Documento de identidad', 'identity-card.ts', 'uploadIdentityCard');
    }

    // Verificar DNI duplicado solo si es nuevo o si cambió
    if (validatedData.idNumber && 
        (!existingIdentityCard || existingIdentityCard.idNumber !== validatedData.idNumber)) {
      const dniExist = await prisma.identityCard.findFirst({
        where: { 
          idNumber: validatedData.idNumber,
          userId: { not: userId } // Excluir el documento actual del usuario
        },
      });

      if (dniExist) {
        throw ServerActionError.DnitAlredyUploadedByOtherUser('identity-card.ts', 'uploadIdentityCard');
      }
    }

    // Procesar imágenes solo si se proporcionaron nuevas
    let imageKeys = {
      frontFileKey: existingIdentityCard?.frontFileKey,
      backFileKey: existingIdentityCard?.backFileKey
    };

    if (validatedData.frontImage || validatedData.backImage) {
      const uploadResult = await uploadDocuments(
        validatedData.frontImage ?? undefined,
        validatedData.backImage ?? undefined,
        userInfo,
        'identity'
      );
      
      imageKeys = {
        frontFileKey: uploadResult.frontFileKey || existingIdentityCard?.frontFileKey,
        backFileKey: uploadResult.backFileKey || existingIdentityCard?.backFileKey
      };
    }

    // Crear o actualizar el documento de identidad
    if (existingIdentityCard) {
      await prisma.identityCard.update({
        where: { id: existingIdentityCard.id },
        data: {
          idNumber: validatedData.idNumber,
          frontFileKey: imageKeys.frontFileKey,
          backFileKey: imageKeys.backFileKey,
          status: 'PENDING', // Resetear el estado si se actualiza
          fileType: FileType.IMAGE,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'uploadIdentityCard.updateIdentityCard', 'identity-card.ts');
      });
    } else {
      await prisma.identityCard.create({
        data: {
          userId,
          idNumber: validatedData.idNumber,
          frontFileKey: imageKeys.frontFileKey!,
          backFileKey: imageKeys.backFileKey!,
          fileType: FileType.IMAGE,
        },
      }).catch(error => {
        throw handlePrismaError(error, 'uploadIdentityCard.createIdentityCard', 'identity-card.ts');
      });
    }

    const updatedUser = await getUserById();

    return {
      success: true,
      data: {
        updatedUser,
        message: 'Documento de identidad subido correctamente.'
      }
    };

  } catch (error) {
    throw error;
  }
}
