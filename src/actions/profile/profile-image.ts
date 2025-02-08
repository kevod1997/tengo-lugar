'use server'

import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { FileInput, uploadDocuments } from "@/lib/file/upload-documents";
import { auth } from "@clerk/nextjs/server";
import { s3Service } from "@/lib/s3/s3";

//la imagen es publica por eso usamos frontFileUrl

export async function uploadProfileImage(processedFile: FileInput, userId: string) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            throw ServerActionError.AuthenticationFailed('profile-image.ts', 'uploadProfileImage');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageKey: true
            }
        });

        if (!user) {
            throw ServerActionError.UserNotFound('profile-image.ts', 'uploadProfileImage');
        }

        // Usar una transacción
        return await prisma.$transaction(async (tx: any) => {
            const userInfo = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName
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