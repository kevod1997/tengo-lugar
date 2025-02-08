import { uploadProfileImage } from "@/actions/profile/profile-image";
import { ApiHandler } from "@/lib/api-handler";
import { ServiceError } from "@/lib/exceptions/service-error";
import { processFile } from "@/lib/file/file-processor";
import { logActionWithErrorHandling } from "../logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

export class ProfileService {
  async updateProfileImage(file: File, userId: string) {
    try {
      // Procesar el archivo
      const processedFile = await processFile(file);
      const fileToUpload = {
        file: processedFile.file,
        preview: processedFile.preview!,
      }

      const uploadProfileImageResult = await uploadProfileImage(fileToUpload, userId);

      if (!uploadProfileImageResult.success) {
        throw ServiceError.DataSubmissionFailed(
          'Subida de imagen de perfil',
          'profile-service.ts',
          'submitInsuranceInfo'
        );
      }

      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.ACTUALIZACION_FOTO_PERFIL,
          status: 'SUCCESS',
          details: { message: uploadProfileImageResult.message }
        },
        {
          fileName: 'profile-service.ts',
          functionName: 'updateProfileImage'
        }
      );

      return ApiHandler.handleSuccess(
        {
          key: uploadProfileImageResult.key,
          message: uploadProfileImageResult.message
        },
      );

    } catch (error) {
      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.ACTUALIZACION_FOTO_PERFIL,
          status: 'FAILED',
          details: { error: (error as Error).message }
        },
        {
          fileName: 'profile-service.ts',
          functionName: 'updateProfileImage'
        }
      );
      return ApiHandler.handleError(error);
    }
  }
}