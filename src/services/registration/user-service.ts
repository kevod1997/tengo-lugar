import { createUser, getUserByClerkId, uploadIdentityCard } from "@/actions";
import { ApiHandler } from "@/lib/api-handler";
import { ServiceError } from "@/lib/exceptions/service-error";
import { processFile } from "@/lib/file/file-processor";
import { ApiResponse } from "@/types/api-types";
import { FormattedUser } from "@/types/user-types";


export class UserRegistrationService {
    async createBaseProfile(personalInfo: any): Promise<ApiResponse<FormattedUser>> {
        const userResult = await createUser({
            ...personalInfo,
        })

        if (!userResult.success) {
            throw ServiceError.UserCreationFailed('user-service.ts', 'createBaseProfile');
        }

        const formattedUser = userResult.data ? await getUserByClerkId(userResult.data.clerkId) : null

        if (!formattedUser) {
            throw ServiceError.ErrorGettingUser('user-service.ts', 'createBaseProfile');
        }

        return ApiHandler.handleSuccess(
            formattedUser,
            'Registro completado, vamos a proceder a validar tu identidad.'
        );
    }

    async uploadIdentityCard(userId: string, identityCard: any) {
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

            const formattedUser = await getUserByClerkId();
            return ApiHandler.handleSuccess(
                formattedUser,
                'Documento de identidad subido correctamente, procederemos a validarlo.'
            )

        } catch (error) {
            throw error;
        }
    }

}