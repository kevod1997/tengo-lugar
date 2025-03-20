import { uploadDriverLicense } from "@/actions"
import { createCarModel } from "@/actions/car/create-car-model";
import { ApiHandler } from "@/lib/api-handler";
import { submitInsuranceInfo } from "@/actions/insurance/submit-insurance";
import { processFile } from "@/lib/file/file-processor";
import { VerificationStatus } from "@prisma/client";
import { logActionWithErrorHandling } from "../logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { submitCardCarInfo } from "@/actions/car-card/submit-car-card";
import { VehicleCardInput } from "@/schemas/validation/car-card-schema";

const fileAndFunctionName = {
  fileName: 'driver-service.ts',
  functionName: {
    uploadDriverLicense: 'uploadDriverLicense',
    submitCarInfo: 'submitCarInfo',
    submitInsurance: 'submitInsurance',
    submitCardCar: 'submitCardCar'
  }
}

export class DriverRegistrationService {

  async uploadDriverLicense(userId: string, driverLicense: any, licenseStatus: VerificationStatus | null) {
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
      // if (!licenseResult.success) {
      //   throw ServiceError.DocumentUploadFailed('Licencia de conducir', 'driver-service.ts', 'uploadDriverLicense');
      // }

      await logActionWithErrorHandling(
        {
          userId,
          action: licenseStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_LICENCIA_CONDUCIR : TipoAccionUsuario.SUBIDA_LICENCIA_CONDUCIR,
          status: 'SUCCESS',
          details: { message: licenseResult.data.message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.uploadDriverLicense
        }
      );

      return ApiHandler.handleSuccess(
        licenseResult.data.updatedUser,
        licenseResult.data.message
      )

    } catch (error) {

      await logActionWithErrorHandling(
        {
          userId,
          action: licenseStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_LICENCIA_CONDUCIR : TipoAccionUsuario.SUBIDA_LICENCIA_CONDUCIR,
          status: 'FAILED',
          details: { message: (error as Error).message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.uploadDriverLicense
        }
      );

      return ApiHandler.handleError(error);
    }
  }

  async submitCarInfo(userId: string, carInfo: any) {
    try {
      const carInfoResult = await createCarModel(userId, carInfo);
      //todo optimizar este codigo en los servicios, ya que se repite en varios lugares y hay que sacar los api handlers de las server action cuando es el caso del error, ya que la respuesta esperada depende si hay success o no me genera un error y devuelve la respuesta posterior, por ejemplo aca me tiraba error en la funcion createCarMOdel pero me tomaba el error del codigo de abajo.
      // if (!carInfoResult.success) {
      //   throw ServiceError.DataSubmissionFailed('Información del vehículo', 'driver-service.ts', 'submitCarInfo');
      // }

      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.REGISTRO_VEHICULO,
          status: 'SUCCESS',
          details: { message: carInfoResult.message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.submitCarInfo
        }
      );

      return ApiHandler.handleSuccess(
        carInfoResult.data,
        carInfoResult.message
      )

    } catch (error) {

      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.REGISTRO_VEHICULO,
          status: 'FAILED',
          details: { error: (error as Error).message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.submitCarInfo
        }
      );

      return ApiHandler.handleError(error)

    }
  }


  async submitInsurance(userId: string, insuranceInfo: any, insuranceStatus: VerificationStatus | null) {
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

      // if (!insuranceInfoResult.success) {
      //   throw ServiceError.DataSubmissionFailed(
      //     'Información del seguro',
      //     'driver-service.ts',
      //     'submitInsuranceInfo'
      //   );
      // }

      await logActionWithErrorHandling(
        {
          userId,
          action: insuranceStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_SEGURO : TipoAccionUsuario.SUBIDA_SEGURO,
          status: 'SUCCESS',
          details: { message: insuranceInfoResult.data?.message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.submitInsurance
        }
      );

      return ApiHandler.handleSuccess(
        insuranceInfoResult.data?.updatedUser,
        insuranceInfoResult.data?.message
      );

    } catch (error) {

      await logActionWithErrorHandling(
        {
          userId,
          action: insuranceStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_SEGURO : TipoAccionUsuario.SUBIDA_SEGURO,
          status: 'FAILED',
          details: { error: (error as Error).message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.submitInsurance
        }
      );

      throw error;
    }
  }

  async submitCardCar(userId: string, cardCarInfo: VehicleCardInput, cardCarStatus: VerificationStatus | null) {
    try {
      if (cardCarInfo.cardFile?.file) {
        const processedFile = await processFile(cardCarInfo.cardFile.file);
        cardCarInfo.cardFile = {
          ...cardCarInfo.cardFile,
          file: processedFile.file,
          preview: processedFile.preview!
        };
      }

      const cardCarInfoResult = await submitCardCarInfo(userId, cardCarInfo);

      // if (!cardCarInfoResult.success) {
      //   throw ServiceError.DataSubmissionFailed(
      //     'Información del seguro',
      //     'driver-service.ts',
      //     'submitCardCarInfo'
      //   );
      // }

      await logActionWithErrorHandling(
        {
          userId,
          action: cardCarStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_CEDULA : TipoAccionUsuario.SUBIDA_CEDULA,
          status: 'SUCCESS',
          details: { message: cardCarInfoResult.data?.message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.submitCardCar
        }
      );

      return ApiHandler.handleSuccess(
        cardCarInfoResult.data?.updatedUser,
        cardCarInfoResult.data?.message
      );

    } catch (error) {

      await logActionWithErrorHandling(
        {
          userId,
          action: cardCarStatus === 'FAILED' ? TipoAccionUsuario.RESUBIDA_CEDULA : TipoAccionUsuario.SUBIDA_CEDULA,
          status: 'FAILED',
          details: { error: (error as Error).message }
        },
        {
          fileName: fileAndFunctionName.fileName,
          functionName: fileAndFunctionName.functionName.submitCardCar
        }
      );
      throw error;
    }
  }
}
