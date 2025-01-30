import { ApiHandler } from '@/lib/api-handler';
import { ServiceError } from '@/lib/exceptions/service-error';
import { StorageService } from '@/lib/s3/storage';
import { ApiResponse } from '@/types/api-types';
import { UserCar } from '@/types/user-types';

export type DocumentUrls = {
  front: string;
  back: string;
}

// export type DocumentResponse = {
//   identityCard?: {
//     id: string;
//     idNumber: number;
//     status: string;
//     verifiedAt: Date | null;
//     failureReason: string | null;
//     urls: DocumentUrls;
//   } | null;
//   licence?: {
//     id: string;
//     expiration: Date;
//     status: string;
//     verifiedAt: Date | null;
//     failureReason: string | null;
//     urls: DocumentUrls;
//   } | null;
//   userInfo: {
//     id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string | null;
//   };
// }

// export class AdminDocumentService {
//   private static async getDocumentUrls(
//     frontKey: string, 
//     backKey: string, 
//     type: 'identity' | 'license'
//   ): Promise<ApiResponse<DocumentUrls>> {
//     try {
//       const [frontUrl, backUrl] = await Promise.all([
//         type === 'identity' 
//           ? StorageService.getIdentityDocumentUrl(frontKey)
//           : StorageService.getDriverLicenseUrl(frontKey),
//         type === 'identity'
//           ? StorageService.getIdentityDocumentUrl(backKey)
//           : StorageService.getDriverLicenseUrl(backKey)
//       ]);

//       return ApiHandler.handleSuccess({
//         front: frontUrl,
//         back: backUrl
//       });
//     } catch (error) {
//       return ApiHandler.handleError(
//         ServiceError.DocumentAccessFailed(type, 'user-service.ts', 'getDocumentUrls')
//       );
//     }
//   }

//   static async getUserDocuments(
//     documents: {
//       identityCard?: { 
//         id: string;
//         idNumber: number;
//         frontFileKey: string; 
//         backFileKey: string;
//         status: string;
//         verifiedAt: Date | null;
//         failureReason: string | null;
//       } | null;
//       licence?: {
//         id: string;
//         expiration: Date;
//         frontFileKey: string; 
//         backFileKey: string;
//         status: string;
//         verifiedAt: Date | null;
//         failureReason: string | null;
//       } | null;
//       userInfo: {
//         id: string;
//         firstName: string;
//         lastName: string;
//         email: string;
//         phone: string | null;
//       };
//     }
//   ): Promise<ApiResponse<DocumentResponse>> {
//     try {
//       const documentUrls: {
//         identityCard?: DocumentUrls;
//         licence?: DocumentUrls;
//       } = {};

//       if (documents.identityCard && (documents.identityCard.backFileKey || documents.identityCard.frontFileKey)) {
//         const identityResponse = await this.getDocumentUrls(
//           documents.identityCard.frontFileKey,
//           documents.identityCard.backFileKey,
//           'identity'
//         );

//         if (!identityResponse.success) {
//           throw ServiceError.DocumentAccessFailed('identity', 'user-service.ts', 'getUserDocuments');
//         }

//         documentUrls.identityCard = identityResponse.data;
//       }

//       if (documents.licence) {
//         const licenceResponse = await this.getDocumentUrls(
//           documents.licence.frontFileKey,
//           documents.licence.backFileKey,
//           'license'
//         );

//         if (!licenceResponse.success) {
//           throw ServiceError.DocumentAccessFailed('license', 'user-service.ts', 'getUserDocuments');
//         }

//         documentUrls.licence = licenceResponse.data;
//       }

//       return ApiHandler.handleSuccess({
//         userInfo: documents.userInfo,
//         identityCard: documents.identityCard ? {
//           ...documents.identityCard,
//           urls: documentUrls.identityCard!
//         } : null,
//         licence: documents.licence ? {
//           ...documents.licence,
//           urls: documentUrls.licence!
//         } : null
//       });
//     } catch (error) {
//       return ApiHandler.handleError(error);
//     }
//   }
// }

export class AdminDocumentService {
  private static async getDocumentUrls(
    frontKey: string, 
    backKey: string, 
    type: 'identity' | 'license'
  ): Promise<ApiResponse<DocumentUrls>> {
    try {
      const [frontUrl, backUrl] = await Promise.all([
        type === 'identity' 
          ? StorageService.getIdentityDocumentUrl(frontKey)
          : StorageService.getDriverLicenseUrl(frontKey),
        type === 'identity'
          ? StorageService.getIdentityDocumentUrl(backKey)
          : StorageService.getDriverLicenseUrl(backKey)
      ]);

      return ApiHandler.handleSuccess({
        front: frontUrl,
        back: backUrl
      });
    } catch (error) {
      return ApiHandler.handleError(
        ServiceError.DocumentAccessFailed(type, 'user-service.ts', 'getDocumentUrls')
      );
    }
  }

  private static async getInsuranceUrl(fileKey: string): Promise<string | null> {
    try {
      return await StorageService.getInsuranceDocumentUrl(fileKey);
    } catch (error) {
      console.error('Error getting insurance URL:', error);
      return null;
    }
  }

  static async getUserDocuments(user: any): Promise<ApiResponse<DocumentResponse>> {
    try {
      const documentUrls: {
        identityCard?: DocumentUrls;
        licence?: DocumentUrls;
      } = {};

      // Procesar documentos de identidad y licencia
      if (user.identityCard) {
        const identityResponse = await this.getDocumentUrls(
          user.identityCard.frontFileKey,
          user.identityCard.backFileKey,
          'identity'
        );
        if (identityResponse.success) {
          documentUrls.identityCard = identityResponse.data;
        }
      }

      if (user.driver?.licence) {
        const licenceResponse = await this.getDocumentUrls(
          user.driver.licence.frontFileKey,
          user.driver.licence.backFileKey,
          'license'
        );
        if (licenceResponse.success) {
          documentUrls.licence = licenceResponse.data;
        }
      }

      // Procesar cars y sus seguros
      const cars: UserCar[] = await Promise.all(
        user.driver?.Car.map(async (driverCar: any) => {
          const car = driverCar.car;
          const policy = car.insuredCar?.currentPolicy;
          let insuranceUrl = null;
          
          if (policy?.fileKey) {
            insuranceUrl = await this.getInsuranceUrl(policy.fileKey);
          }

          return {
            id: car.id,
            plate: car.plate,
            brand: car.carModel?.brand?.name || '',
            model: car.carModel?.model || '',
            year: car.carModel?.year || null,
            insurance: {
              status: policy?.status || null,
              failureReason: policy?.failureReason || null,
              hasFileKey: Boolean(policy?.fileKey),
              url: insuranceUrl,
              policy: policy || null
            }
          };
        }) || []
      );

      return ApiHandler.handleSuccess({
        userInfo: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        },
        identityCard: user.identityCard ? {
          ...user.identityCard,
          urls: documentUrls.identityCard!
        } : null,
        licence: user.driver?.licence ? {
          ...user.driver.licence,
          urls: documentUrls.licence!
        } : null,
        cars
      });
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }
}

// Y actualizamos el tipo de respuesta
export type DocumentResponse = {
  identityCard?: {
    id: string;
    idNumber: number;
    status: string;
    verifiedAt: Date | null;
    failureReason: string | null;
    urls: DocumentUrls;
  } | null;
  licence?: {
    id: string;
    expiration: Date;
    status: string;
    verifiedAt: Date | null;
    failureReason: string | null;
    urls: DocumentUrls;
  } | null;
  cars: UserCar[];
  userInfo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}