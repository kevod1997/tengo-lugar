'use server'

import { StorageService } from "@/lib/s3/storage";
import { ApplicationError } from "@/lib/exceptions";
import { FileType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { DriverLicenseInput, serverDriverLicenseSchema } from "@/lib/validations/user-validation";
import { processImage } from "@/lib/images/process-image";

export async function uploadDriverLicense(
  driverId: string,
  input: DriverLicenseInput
) {
  try {
    const validatedData = serverDriverLicenseSchema.parse(input);

    const driver = await prisma.driver.findUnique({
      where: { userId: driverId },
      include: {
        licence: true,
        user: true
      },
    });
    let newDriver = null
    if (!driver) {
      newDriver = await prisma.driver.create({
        data: {
          userId: driverId,
        },
        include: {
          licence: true,
          user: true
        }
      });
    }

    const userInfo = newDriver ? {
      id: newDriver.user.id,
      firstName: newDriver.user.firstName,
      lastName: newDriver.user.lastName
    } : {
      id: driver!.user.id,
      firstName: driver!.user.firstName,
      lastName: driver!.user.lastName
    };

    if (driver?.licence?.status === 'PENDING' || driver?.licence?.status === 'VERIFIED') {
      throw new ApplicationError('Licencia pendiente o ya verificada', 400);
    }

    // Verificar que las imágenes no sean undefined
    if (!validatedData.frontImage?.file || !validatedData.backImage?.file) {
      throw new ApplicationError('Las imágenes de la licencia son requeridas', 400);
    }

    // Extraer la data base64 de la imagen
    const getFrontImageData = () => {
      if (!validatedData.frontImage) {
        throw new ApplicationError('La imagen frontal es requerida', 400);
      }
      const base64Data = validatedData.frontImage.preview;
      if (!base64Data) {
        throw new ApplicationError('La imagen frontal es requerida', 400);
      }
      return Buffer.from(
        base64Data.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
    };

    const getBackImageData = () => {
      if (!validatedData.backImage) {
        throw new ApplicationError('La imagen trasera es requerida', 400);
      }
      const base64Data = validatedData.backImage.preview;
      if (!base64Data) {
        throw new ApplicationError('La imagen trasera es requerida', 400);
      }
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
      StorageService.getDriverLicenseUploadUrl(
        'jpg',
        'image/jpeg',
        userInfo
      ),
      StorageService.getDriverLicenseUploadUrl(
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
    const licence = await prisma.licence.create({
      data: {
        driverId: (driver?.id || newDriver?.id)!,
        expiration: new Date(validatedData.expirationDate).toISOString(),
        frontFileKey: frontUploadData.key,
        backFileKey: backUploadData.key,
        fileType: FileType.IMAGE,
      },
    });

    return {
      success: true,
      data: {
        id: licence.id,
        message: 'Licencia cargada exitosamente',
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
      error: 'Error desconocido al procesar la licencia',
    };
  }
}

export async function getDriverLicenseStatus(driverId: string) {
  try {
    const licence = await prisma.licence.findUnique({
      where: { driverId },
    });

    if (!licence) {
      return {
        success: true,
        data: {
          status: 'PENDING_UPLOAD',
          message: 'Licencia pendiente de carga',
        },
      };
    }

    return {
      success: true,
      data: {
        status: licence.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
        verifiedAt: licence.verifiedAt,
        expiration: licence.expiration,
        message: licence.status === 'VERIFIED'
          ? 'Licencia verificada'
          : 'Licencia en proceso de verificación',
      },
    };

  } catch (error) {
    return {
      success: false,
      error: 'Error al consultar el estado de la licencia',
    };
  }
}