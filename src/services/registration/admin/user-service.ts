import { ApiHandler } from '@/lib/api-handler';
import { StorageService } from '@/lib/s3/storage';
import { ApiResponse } from '@/types/api-types';
import { UserCar } from '@/types/user-types';

export type DocumentUrls = {
  front?: string | null;
  back?: string | null;
}

export class AdminDocumentService {

  private static async getDocumentUrls(
    frontKey: string,
    backKey: string,
    type: 'identity' | 'license'
  ): Promise<ApiResponse<DocumentUrls>> {
    try {
      const [frontUrl, backUrl] = await Promise.all([
        (async () => {
          const url = type === 'identity'
            ? await StorageService.getIdentityDocumentUrl(frontKey)
            : await StorageService.getDriverLicenseUrl(frontKey);
          return url;
        })(),
        (async () => {
          const url = type === 'identity'
            ? await StorageService.getIdentityDocumentUrl(backKey)
            : await StorageService.getDriverLicenseUrl(backKey);
          return url;
        })()
      ]);
      return ApiHandler.handleSuccess({
        front: frontUrl,
        back: backUrl
      });
    } catch (error) {
      throw error;
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

  private static async getCarCardUrl(fileKey: string): Promise<string | null> {
    try {
      return await StorageService.getCarCardDocumentUrl(fileKey);
    } catch (error) {
      console.error('Error getting vehicle card URL:', error);
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
      // const cars: UserCar[] = await Promise.all(
      //   user.driver?.Car.map(async (driverCar: any) => {
      //     const car = driverCar.car;
      //     const policy = car.insuredCar?.currentPolicy;
      //     let insuranceUrl = null;

      //     if (policy?.fileKey) {
      //       insuranceUrl = await this.getInsuranceUrl(policy.fileKey);
      //     }

      //     return {
      //       id: car.id,
      //       plate: car.plate,
      //       brand: car.carModel?.brand?.name || '',
      //       model: car.carModel?.model || '',
      //       year: car.carModel?.year || null,
      //       insurance: {
      //         status: policy?.status || null,
      //         failureReason: policy?.failureReason || null,
      //         hasFileKey: Boolean(policy?.fileKey),
      //         url: insuranceUrl,
      //         policy: policy || null
      //       }
      //     };
      //   }) || []
      // );

      const cars: UserCar[] = await Promise.all(
        user.driver?.Car.map(async (driverCar: any) => {
          const car = driverCar.car;
          const policy = car.insuredCar?.currentPolicy;
          let insuranceUrl = null;

          if (policy?.fileKey) {
            insuranceUrl = await this.getInsuranceUrl(policy.fileKey);
          }

          // Procesar tarjetas vehiculares
          const vehicleCards = driverCar.vehicleCards || [];
          let vehicleCard = null;
          let hasGreenCard = false;
          let hasBlueCard = false;
          let hasPendingCards = false;

          for (const card of vehicleCards) {
            const cardUrl = card.fileKey ? await this.getCarCardUrl(card.fileKey) : null;

            if (card.status === 'PENDING') {
              hasPendingCards = true;
            }

            hasGreenCard = hasGreenCard || card.cardType === 'GREEN';
            hasBlueCard = hasBlueCard || card.cardType === 'BLUE';

            // Usamos la última tarjeta procesada como la tarjeta principal
            vehicleCard = {
              id: card.id,
              cardType: card.cardType,
              status: card.status,
              failureReason: card.failureReason,
              hasFileKey: Boolean(card.fileKey),
              expirationDate: card.expirationDate,
              fileType: card.fileType,
              url: cardUrl || undefined
            };
          }

          return {
            id: car.id,
            plate: car.plate,
            brand: car.carModel?.brand?.name || '',
            model: car.carModel?.model || '',
            fuelType: car.carModel?.fuelType || null,
            averageFuelConsume: car.carModel?.averageFuelConsume || null,
            year: car.carModel?.year || 0,
            insurance: {
              status: policy?.status || null,
              failureReason: policy?.failureReason || null,
              hasFileKey: Boolean(policy?.fileKey),
              url: insuranceUrl,
              policy: policy || null
            },
            vehicleCard,
            hasGreenCard,
            hasBlueCard,
            hasPendingCards
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