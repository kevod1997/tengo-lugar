'use server'

import { FileType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { DriverLicenseInput, serverDriverLicenseSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { ServiceError } from "@/lib/exceptions/service-error";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import { headers } from "next/headers";
import { uploadDocuments } from "@/lib/file/upload-documents";

export async function uploadDriverLicense(
  userId: string,
  input: DriverLicenseInput
) {
  // const headersList = await headers();
  // const contentLength = parseInt(headersList.get('content-length') || '0', 10);
  // console.log(`Tamaño de la solicitud: ${contentLength} bytes`);

  // Verificar el tamaño antes de procesar
  // const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
  // if (contentLength > MAX_SIZE) {
  //   throw new Error(`Tamaño de archivo excedido. Máximo permitido: ${MAX_SIZE} bytes`);
  // }

  try {
    const validatedData = serverDriverLicenseSchema.parse(input);

    const { userId: clerkId } = await auth()
    if (!clerkId) {
      throw ServerActionError.AuthenticationFailed('license.ts', 'uploadDriverLicense');
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: userId },
      include: {
        licence: true,
        user: true
      },
    });

    let newDriver = null;
    if (!driver) {
      newDriver = await prisma.driver.create({
        data: {
          userId: userId,
        },
        include: {
          licence: true,
          user: true
        }
      }).catch(error => {
        throw handlePrismaError(error, 'uploadDriverLicense.createDriver', 'license.ts');
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

    const existingLicense = driver?.licence;

    if (existingLicense?.status === 'VERIFIED' || existingLicense?.status === 'PENDING') {
      throw ServiceError.DocumentUploadFailed('Licencia de conducir', 'license.ts', 'uploadDriverLicense');
    }

    let imageKeys = {
      frontFileKey: existingLicense?.frontFileKey,
      backFileKey: existingLicense?.backFileKey
    };

    if (validatedData.frontImage || validatedData.backImage) {
      const uploadResult = await uploadDocuments(
        validatedData.frontImage ?? undefined,
        validatedData.backImage ?? undefined,
        userInfo,
        'license'
      );

      imageKeys = {
        frontFileKey: uploadResult.frontFileKey || existingLicense?.frontFileKey,
        backFileKey: uploadResult.backFileKey || existingLicense?.backFileKey
      };
    }

    // Crear o actualizar la licencia
    if (existingLicense) {
      const licence = await prisma.licence.update({
        where: { id: existingLicense.id },
        data: {
          expiration: new Date(validatedData.expirationDate).toISOString(),
          frontFileKey: imageKeys.frontFileKey,
          backFileKey: imageKeys.backFileKey,
          status: 'PENDING',
          fileType: FileType.IMAGE,
        }
      }).catch(error => {
        throw handlePrismaError(error, 'uploadDriverLicense.updateLicence', 'license.ts');
      });

      return {
        success: true,
        data: {
          id: licence.id,
          message: 'Licencia actualizada exitosamente',
        },
      };
    } else {
      const licence = await prisma.licence.create({
        data: {
          driverId: (driver?.id || newDriver?.id)!,
          expiration: new Date(validatedData.expirationDate).toISOString(),
          frontFileKey: imageKeys.frontFileKey!,
          backFileKey: imageKeys.backFileKey!,
          fileType: FileType.IMAGE,
        }
      }).catch(error => {
        throw handlePrismaError(error, 'uploadDriverLicense.createLicence', 'license.ts');
      });

      return {
        success: true,
        data: {
          id: licence.id,
          message: 'Licencia cargada exitosamente',
        },
      };
    }

  } catch (error) {
    console.log('Error uploading driver license:', error);
    throw error;

  }
}
