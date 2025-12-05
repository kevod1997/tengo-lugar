
import { updateUser, getUserById, uploadIdentityCard, updateUserProfile } from "@/actions";
import { ApiHandler } from "@/lib/api-handler";
import { ServiceError } from "@/lib/exceptions/service-error";
import { processFile } from "@/lib/file/file-processor";
import { TipoAccionUsuario } from "@/types/actions-logs";
import type { ApiResponse } from "@/types/api-types";
import type { FormattedUser } from "@/types/user-types";

import { logActionWithErrorHandling } from "../logging/logging-service";

import type { VerificationStatus } from "@prisma/client";

export class UserRegistrationService {
    async createBaseProfile(userId: string, personalInfo: any): Promise<ApiResponse<FormattedUser>> {
        try {
            const userResult = await updateUser({
                ...personalInfo,
            })

            // if (!userResult.success) {
            //     throw ServiceError.UserUpdateFailed('user-service.ts', 'createBaseProfile');
            // }

            const formattedUser = userResult.data ? await getUserById(userId) : null

            if (!formattedUser) {
                throw ServiceError.ErrorGettingUser('user-service.ts', 'createBaseProfile');
            }

            await logActionWithErrorHandling(
                {
                    userId,
                    action: TipoAccionUsuario.REGISTRO_USUARIO,
                    status: 'SUCCESS',
                    details: { message: userResult.data.message }
                },
                {
                    fileName: 'user-service.ts',
                    functionName: 'createBaseProfile'
                }
            );

            return ApiHandler.handleSuccess(
                formattedUser,
                userResult.data.message
            );
        } catch (error) {

            await logActionWithErrorHandling(
                {
                    userId,
                    action: TipoAccionUsuario.REGISTRO_USUARIO,
                    status: 'FAILED',
                    details: { error: (error as Error).message }
                },
                {
                    fileName: 'user-service.ts',
                    functionName: 'createBaseProfile'
                }
            );
            throw error;
        }
    }

    async updateUserProfile(userId: string, profileData: any): Promise<ApiResponse<FormattedUser>> {
        try {
            // Call the server action to update user
            const userResult = await updateUserProfile({
                ...profileData,
            });

            // if (!userResult.success) {
            //     throw ServiceError.UserUpdateFailed('profile-update-service.ts', 'updateUserProfile');
            // }

            // Get updated user data
            const formattedUser = userResult.data ? await getUserById(userId) : null;

            if (!formattedUser) {
                throw ServiceError.ErrorGettingUser('profile-update-service.ts', 'updateUserProfile');
            }

            // Log the successful update
            await logActionWithErrorHandling(
                {
                    userId,
                    action: TipoAccionUsuario.ACTUALIZACION_PERFIL,
                    status: 'SUCCESS',
                    details: { message: userResult.data.message }
                },
                {
                    fileName: 'profile-update-service.ts',
                    functionName: 'updateUserProfile'
                }
            );

            return ApiHandler.handleSuccess(
                formattedUser,
                'Perfil actualizado correctamente'
            );
        } catch (error) {
            // Log the failed update
            await logActionWithErrorHandling(
                {
                    userId,
                    action: TipoAccionUsuario.ACTUALIZACION_PERFIL,
                    status: 'FAILED',
                    details: { error: (error as Error).message }
                },
                {
                    fileName: 'profile-update-service.ts',
                    functionName: 'updateUserProfile'
                }
            );

            throw error;
        }
    }

    async uploadIdentityCard(userId: string, identityCard: any, identityStatus: VerificationStatus | null): Promise<ApiResponse<FormattedUser>> {
        try {
            // Procesar imágenes si existen
            if (identityCard.frontImage?.file) {
                const processedFront = await processFile(identityCard.frontImage.file);
                identityCard.frontImage = {
                    ...identityCard.frontImage,
                    file: processedFront.file,
                    preview: processedFront.preview
                };
            }

            if (identityCard.backImage?.file) {
                const processedBack = await processFile(identityCard.backImage.file);
                identityCard.backImage = {
                    ...identityCard.backImage,
                    file: processedBack.file,
                    preview: processedBack.preview
                };
            }

            const identityCardResult = await uploadIdentityCard(userId, identityCard);

            // if (!identityCardResult.success) {
            //     throw ServiceError.DocumentUploadFailed('Documento de identidad', 'user-service.ts', 'uploadIdentityCard');
            // }

            await logActionWithErrorHandling(
                {
                    userId,
                    action: identityStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_DOCUMENTO_IDENTIDAD : TipoAccionUsuario.SUBIDA_DOCUMENTO_IDENTIDAD,
                    status: 'SUCCESS',
                    details: { message: identityCardResult.data.message }
                },
                {
                    fileName: 'user-service.ts',
                    functionName: 'uploadIdentityCard'
                }
            );

            return ApiHandler.handleSuccess(
                identityCardResult.data.updatedUser,
                'Documento de identidad subido correctamente, procederemos a validarlo.'
            )

        } catch (error) {
            await logActionWithErrorHandling(
                {
                    userId: userId,
                    action: identityStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_DOCUMENTO_IDENTIDAD : TipoAccionUsuario.SUBIDA_DOCUMENTO_IDENTIDAD,
                    status: 'FAILED',
                    details: { error: (error as Error).message }
                },
                {
                    fileName: 'user-service.ts',
                    functionName: 'uploadIdentityCard'
                }
            );
            throw error;
        }
    }

}