import { s3Service } from './s3';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  static async getProfileImageUploadUrl(fileExtension: string, contentType: string) {
    const fileName = `${uuidv4()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('profile', fileName, contentType);
  }

  static async getIdentityDocumentUploadUrl(fileExtension: string, contentType: string) {
    const fileName = `${uuidv4()}.${fileExtension}`;
    return await s3Service.getSignedUploadUrl('identity', fileName, contentType);
  }

  static async getIdentityDocumentUrl(key: string) {
    return await s3Service.getSignedDownloadUrl(key);
  }

  static getProfileImageUrl(key: string) {
    return s3Service.getPublicUrl(key);
  }
}