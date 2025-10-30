import { s3Service, UserInfo } from './s3';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  static async getProfileImageUploadUrl(
    fileExtension: string,
    contentType: string,
    userInfo: UserInfo
  ) {
    const fileName = `${uuidv4()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('profile', fileName, contentType, userInfo);
  }

  static getProfileImageUrl(key: string) {
    return s3Service.getPublicUrl(key);
  }

  static async getIdentityDocumentUploadUrl(
    fileExtension: string,
    contentType: string,
    userInfo: UserInfo
  ) {
    const fileName = `${uuidv4()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('identity', fileName, contentType, userInfo);
  }

  static async getDriverLicenseUploadUrl(
    fileExtension: string,
    contentType: string,
    userInfo: UserInfo
  ) {
    const fileName = `${uuidv4()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('license', fileName, contentType, userInfo);
  }

  // static async getIdentityDocumentUrl(key: string) {
  //   return await s3Service.getSignedDownloadUrl(key);
  // }

  // static async getDriverLicenseUrl(key: string) {
  //   return await s3Service.getSignedDownloadUrl(key);
  // }

  static async getIdentityDocumentUrl(key: string | null): Promise<string | null> {
    if (!key) return null;
    return await s3Service.getSignedDownloadUrl(key);
  }

  static async getDriverLicenseUrl(key: string | null): Promise<string | null> {
    if (!key) return null;
    return await s3Service.getSignedDownloadUrl(key);
  }

  static async getInsuranceDocumentUploadUrl(
    fileExtension: string,
    contentType: string,
    userInfo: UserInfo,
    carPlate?: string
  ) {
    const fileName = `${uuidv4()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('insurance', fileName, contentType, userInfo, carPlate);
  }

  static async getInsuranceDocumentUrl(key: string) {
    return await s3Service.getSignedDownloadUrl(key);
  }

  static async getCarCardDocumentUploadUrl(
    fileExtension: string,
    contentType: string,
    userInfo: UserInfo,
    carPlate?: string
  ) {
    const fileName = `${uuidv4()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('car-card', fileName, contentType, userInfo, carPlate);
  }

  static async getCarCardDocumentUrl(key: string) {
    return await s3Service.getSignedDownloadUrl(key);
  }

  static async getPaymentProofUploadUrl(
    fileExtension: string,
    contentType: string,
    userInfo: UserInfo
  ) {
    const fileName = `comprobante-${Date.now()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('payment-proof', fileName, contentType, userInfo);
  }

  static async getPaymentProofUrl(key: string) {
    return await s3Service.getSignedDownloadUrl(key);
  }

  static async getDriverPayoutProofUploadUrl(
    fileExtension: string,
    contentType: string,
    userInfo: UserInfo
  ) {
    const fileName = `payout-${Date.now()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('driver-payout', fileName, contentType, userInfo);
  }

  static async getDriverPayoutProofUrl(key: string) {
    return await s3Service.getSignedDownloadUrl(key);
  }

  // Función de utilidad para eliminar archivos si es necesario
  // static async deleteFile(key: string) {
  //   return await s3Service.deleteFile(key);
  // }
}