'use server'

import { headers } from "next/headers";

import { FileType } from "@prisma/client";

import { auth } from "@/lib/auth";
;
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { ServiceError } from "@/lib/exceptions/service-error";
import { uploadDocuments } from "@/lib/file/upload-documents";
import prisma from "@/lib/prisma";
import { serverDriverLicenseSchema } from "@/schemas";
import type { DriverLicenseInput} from "@/schemas";
import { splitFullName } from "@/utils/format/user-formatter";

import { getUserById } from "./get-user";

export async function uploadDriverLicense(
  userId: string,
  input: DriverLicenseInput
) {

  try {
    const validatedData = serverDriverLicenseSchema.parse(input);

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
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

    let firstName: string;
    let lastName: string;

    if (newDriver) {
      ({ firstName, lastName } = splitFullName(newDriver.user.name));
    } else {
      ({ firstName, lastName } = splitFullName(driver!.user.name));
    }

    const userInfo = newDriver ? {
      id: newDriver.user.id,
      firstName,
      lastName
    } : {
      id: driver!.user.id,
      firstName,
      lastName
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
      await prisma.licence.update({
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

      const updatedUser = await getUserById();

      return {
        success: true,
        data: {
          updatedUser,
          message: 'Licencia actualizada exitosamente',
        },
      };
    } else {
      await prisma.licence.create({
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

      const updatedUser = await getUserById();

      return {
        success: true,
        data: {
          updatedUser,
          message: 'Licencia cargada exitosamente',
        },
      };
    }

  } catch (error) {
    throw error;
  }
}
