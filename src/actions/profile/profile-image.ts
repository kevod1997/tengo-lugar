'use server'

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import type { FileInput} from "@/lib/file/upload-documents";
import { uploadDocuments } from "@/lib/file/upload-documents";
;
import prisma from "@/lib/prisma";
import { s3Service } from "@/lib/s3/s3";
import { splitFullName } from "@/utils/format/user-formatter";

//la imagen es publica por eso usamos frontFileUrl

export async function uploadProfileImage(processedFile: FileInput, userId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session) {
            throw ServerActionError.AuthenticationFailed('profile-image.ts', 'uploadProfileImage');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                profileImageKey: true
            }
        });

        if (!user) {
            throw ServerActionError.UserNotFound('profile-image.ts', 'uploadProfileImage');
        }

        // Usar una transacción
        return await prisma.$transaction(async (tx: any) => {

            const { firstName, lastName } = splitFullName(user.name);
            const userInfo = {
                id: user.id,
                firstName,
                lastName
            };

            const uploadResult = await uploadDocuments(
                processedFile,
                undefined,
                userInfo,
                'profile'
            );

            try {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        profileImageKey: uploadResult.frontFileUrl
                    }
                });

                // Si había una imagen anterior, la eliminamos
                if (user.profileImageKey) {
                    await s3Service.deleteObject(user.profileImageKey);
                }

                return {
                    success: true,
                    message: 'Imagen de perfil subida correctamente',
                    key: uploadResult.frontFileUrl
                };

            } catch (error) {
                // Si falla la actualización, eliminamos la imagen recién subida
                if (uploadResult.frontFileKey) {
                    await s3Service.deleteObject(uploadResult.frontFileKey);
                }
                throw handlePrismaError(error, 'uploadProfileImage.updateUser', 'profile-image.ts');
            }
        });

    } catch (error) {
        throw error;
    }
}