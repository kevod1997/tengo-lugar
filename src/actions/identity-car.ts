'use server'

import { StorageService } from "@/lib/storage";
import { identityCardSchema, IdentityCardInput } from "@/lib/validations/user-validation";
import { ApplicationError } from "@/lib/exceptions";
import { FileType } from "@prisma/client";
import sharp from "sharp";
import prisma from "@/lib/prisma";

async function processImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Procesar la imagen con sharp
  const processedBuffer = await sharp(buffer)
    .resize(1200, 1200, { // Tamaño máximo manteniendo aspecto
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 }) // Convertir a JPEG con calidad 80
    .toBuffer();

  return processedBuffer;
}

export async function uploadIdentityCard(
  userId: string, 
  input: IdentityCardInput
) {
  try {
    const validatedData = identityCardSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { identityCard: true },
    });

    if (!user) {
      throw new ApplicationError('Usuario no encontrado', 404);
    }

    if (user.identityCard) {
      throw new ApplicationError('El usuario ya tiene documentos de identidad cargados', 400);
    }

    // Procesar las imágenes
    const [frontProcessedImage, backProcessedImage] = await Promise.all([
      processImage(validatedData.frontImage.file),
      processImage(validatedData.backImage.file),
    ]);

    // Obtener URLs firmadas para la carga usando el método correcto
    const [frontUploadData, backUploadData] = await Promise.all([
      StorageService.getIdentityDocumentUploadUrl('jpg', 'image/jpeg'),
      StorageService.getIdentityDocumentUploadUrl('jpg', 'image/jpeg'),
    ]);

    // Realizar la carga a S3
    await Promise.all([
      fetch(frontUploadData.signedUrl, {
        method: 'PUT',
        body: frontProcessedImage,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      }),
      fetch(backUploadData.signedUrl, {
        method: 'PUT',
        body: backProcessedImage,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      }),
    ]);

    // Crear registro en la base de datos usando las keys devueltas
    const identityCard = await prisma.identityCard.create({
      data: {
        userId,
        idNumber: validatedData.idNumber,
        frontFileKey: frontUploadData.key,
        backFileKey: backUploadData.key,
        fileType: FileType.IMAGE,
      },
    });

    return {
      success: true,
      data: {
        id: identityCard.id,
        message: 'Documentos cargados exitosamente',
      },
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
      error: 'Error desconocido al procesar documentos de identidad',
    };
  }
}

export async function getIdentityCardStatus(userId: string) {
  try {
    const identityCard = await prisma.identityCard.findUnique({
      where: { userId },
    });

    if (!identityCard) {
      return {
        success: true,
        data: {
          status: 'PENDING_UPLOAD',
          message: 'Documentos de identidad pendientes de carga',
        },
      };
    }

    return {
      success: true,
      data: {
        status: identityCard.isVerified ? 'VERIFIED' : 'PENDING_VERIFICATION',
        verifiedAt: identityCard.verifiedAt,
        message: identityCard.isVerified 
          ? 'Documentos verificados'
          : 'Documentos en proceso de verificación',
      },
    };

  } catch (error) {
    return {
      success: false,
      error: 'Error al consultar el estado de verificación',
    };
  }
}