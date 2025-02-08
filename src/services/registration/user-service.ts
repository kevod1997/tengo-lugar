import { createUser, getUserByClerkId, uploadIdentityCard } from "@/actions";
import { ApiHandler } from "@/lib/api-handler";
import { ServiceError } from "@/lib/exceptions/service-error";
import { processFile } from "@/lib/file/file-processor";
import { ApiResponse } from "@/types/api-types";
import { FormattedUser } from "@/types/user-types";
import { logActionWithErrorHandling } from "../logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { VerificationStatus } from "@prisma/client";


export class UserRegistrationService {
    async createBaseProfile(personalInfo: any): Promise<ApiResponse<FormattedUser>> {
        try {
            const userResult = await createUser({
                ...personalInfo,
            })

            if (!userResult.success) {
                throw ServiceError.UserCreationFailed('user-service.ts', 'createBaseProfile');
            }

            const formattedUser = userResult.data ? await getUserByClerkId(userResult.data.user.clerkId) : null

            if (!formattedUser) {
                throw ServiceError.ErrorGettingUser('user-service.ts', 'createBaseProfile');
            }

            await logActionWithErrorHandling(
                {
                    userId: formattedUser.id,
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
                    userId: 'N/A',
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

            if (!identityCardResult.success) {
                throw ServiceError.DocumentUploadFailed('Documento de identidad', 'user-service.ts', 'uploadIdentityCard');
            }

            await logActionWithErrorHandling(
                {
                    userId: identityCardResult.data.updatedUser.id,
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