import { getUserByClerkId, uploadDriverLicense } from "@/actions"
import { createCarModel } from "@/actions/car/create-car-model";
import { ApiHandler } from "@/lib/api-handler";
import { ServiceError } from "@/lib/exceptions/service-error";
import { submitInsuranceInfo } from "@/actions/insurance/submit-insurance";
import { processFile } from "@/lib/file/file-processor";

export class DriverRegistrationService {

  async uploadDriverLicense(userId: string, driverLicense: any) {
    try {

      // Procesar imágenes si existen
      if (driverLicense.frontImage?.file) {
        const processedFront = await processFile(driverLicense.frontImage.file);
        driverLicense.frontImage = {
          ...driverLicense.frontImage,
          file: processedFront.file,
          preview: processedFront.preview
        };
      }

      if (driverLicense.backImage?.file) {
        const processedBack = await processFile(driverLicense.backImage.file);
        driverLicense.backImage = {
          ...driverLicense.backImage,
          file: processedBack.file,
          preview: processedBack.preview
        };
      }

      const licenseResult = await uploadDriverLicense(userId, driverLicense);
      if (!licenseResult.success) {
        throw ServiceError.DocumentUploadFailed('Licencia de conducir', 'driver-service.ts', 'uploadDriverLicense');
      }

      const formattedUser = await getUserByClerkId();

      return ApiHandler.handleSuccess(
        formattedUser,
        'Licencia de conducir subida correctamente, procederemos a validarla.'
      )

    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  async submitCarInfo(userId: string, carInfo: any) {
    try {
      const carInfoResult = await createCarModel(userId, carInfo);
      if (!carInfoResult.success) {
        throw ServiceError.DataSubmissionFailed('Información del vehículo', 'driver-service.ts', 'submitCarInfo');
      }

      const formattedUser = await getUserByClerkId();

      return ApiHandler.handleSuccess(
        formattedUser,
        'Información del vehículo guardada correctamente.'
      )

    } catch (error) {
      throw error;
    }
  }


  async submitInsurance(userId: string, insuranceInfo: any) {
    try {
      if (insuranceInfo.policyFile?.file) {
        const processedFile = await processFile(insuranceInfo.policyFile.file);
        insuranceInfo.policyFile = {
          ...insuranceInfo.policyFile,
          file: processedFile.file,
          preview: processedFile.preview
        };
      }

      const insuranceInfoResult = await submitInsuranceInfo(userId, insuranceInfo);

      if (!insuranceInfoResult.success) {
        throw ServiceError.DataSubmissionFailed(
          'Información del seguro',
          'driver-service.ts',
          'submitInsuranceInfo'
        );
      }

      const formattedUser = await getUserByClerkId();
      return ApiHandler.handleSuccess(
        formattedUser,
        'Información del seguro guardada correctamente.'
      );

    } catch (error) {
      console.error('Submit insurance error:', error);
      throw error;
    }
  }
}
