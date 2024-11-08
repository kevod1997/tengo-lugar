'use server'

import { StorageService } from "@/lib/storage";
import { identityCardSchema, IdentityCardInput, serverIdentityCardSchema } from "@/lib/validations/user-validation";
import { ApplicationError } from "@/lib/exceptions";
import { FileType } from "@prisma/client";
import sharp from "sharp";
import prisma from "@/lib/prisma";

async function processImage(buffer: Buffer) {
  try {
    // Procesar la imagen con sharp
    const processedBuffer = await sharp(buffer)
      .resize(1200, 1200, { // Tamaño máximo manteniendo aspecto
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 }) // Convertir a JPEG con calidad 80
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Error al procesar la imagen');
  }
}

export async function uploadIdentityCard(
  userId: string,
  input: IdentityCardInput
) {
  try {
    const validatedData = serverIdentityCardSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { identityCard: true },
    });

    if (!user) {
      throw new ApplicationError('Usuario no encontrado', 404);
    }

    const userInfo = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName
    };

    if (user.identityCard) {
      throw new ApplicationError('El usuario ya tiene documentos de identidad cargados', 400);
    }

    // Verificar que las imágenes no sean undefined
    if (!validatedData.frontImage?.file || !validatedData.backImage?.file) {
      throw new ApplicationError('Las imágenes de la tarjeta de identidad son requeridas', 400);
    }

    // Extraer la data base64 de la imagen
    const getFrontImageData = () => {
      if (!validatedData.frontImage) {
        throw new ApplicationError('La imagen frontal es requerida', 400);
      }
      const base64Data = (validatedData.frontImage.file as any).preview;
      return Buffer.from(
        base64Data.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
    };

    const getBackImageData = () => {
      if (!validatedData.backImage) {
        throw new ApplicationError('La imagen trasera es requerida', 400);
      }
      const base64Data = (validatedData.backImage.file as any).preview;
      return Buffer.from(
        base64Data.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
    };

    // Procesar las imágenes
    const [frontProcessedImage, backProcessedImage] = await Promise.all([
      processImage(getFrontImageData()),
      processImage(getBackImageData()),
    ]);

    // Obtener URLs firmadas para la carga
    const [frontUploadData, backUploadData] = await Promise.all([
      StorageService.getIdentityDocumentUploadUrl(
        'jpg', 
        'image/jpeg',
        userInfo
      ),
      StorageService.getIdentityDocumentUploadUrl(
        'jpg', 
        'image/jpeg',
        userInfo
      ),
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

    // Crear registro en la base de datos
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
    console.error('Server - Error details:', error);
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
        status: identityCard.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
        verifiedAt: identityCard.verifiedAt,
        message: identityCard.status === 'VERIFIED'
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