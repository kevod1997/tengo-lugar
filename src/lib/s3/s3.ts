import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3ServiceError } from "../exceptions/s3-service-error";

export interface UserInfo {
  firstName: string;
  lastName: string;
  id: string;
}

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    if (!process.env.AWS_BUCKET_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
      throw S3ServiceError.S3ConfigFailed('s3.ts', 'constructor');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  private getObjectKey(type: 'profile' | 'identity' | 'license' | 'insurance' | 'car-card', fileName: string, userInfo: UserInfo, carPlate?: string) {
    const prefix = {
      profile: 'public/profile-images',
      identity: 'private/identity-documents',
      license: 'private/driver-licenses',
      insurance: 'private/insurance-documents',
      'car-card': 'private/car-card',
    }[type];

    const timestamp = Date.now();
    const hasCarPlate = carPlate ? `-${carPlate}` : `${userInfo.firstName}-${userInfo.lastName}`;
    const sanitizedName = `${hasCarPlate}`.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9-]/g, '-'); // Reemplazar caracteres especiales con guiones

    return `${prefix}/${userInfo.id}/${sanitizedName}/${timestamp}-${fileName}`;
  }

  async getSignedUploadUrl(
    type: 'profile' | 'identity' | 'license' | 'insurance' | 'car-card',
    fileName: string,
    contentType: string,
    userInfo: UserInfo,
    carPlate?: string,
    expiresIn: number = 3600
  ) {
    const key = this.getObjectKey(type, fileName, userInfo, carPlate);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return { signedUrl, key };
    } catch (error: any) {
      throw S3ServiceError.UrlGenerationFailed('s3.ts', 'getSignedUploadUrl', `Error generando URL firmada: ${error.message}`);
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error: any) {
      throw S3ServiceError.DownloadFailed('s3.ts', 'getSignedDownloadUrl', `Error generando URL de descarga: ${error.message}`);
    }
  }

  // async deleteObject(key: string) {
  //   console.log('Deleting object', key);
  //   try {
  //     const command = new DeleteObjectCommand({
  //       Bucket: this.bucketName,
  //       Key: key,
  //     });
  //     return await this.s3Client.send(command);
  //   } catch (error: any) {
  //     throw S3ServiceError.DeleteFailed('s3.ts', 'deleteObject', `Error eliminando objeto: ${error.message}`);
  //   }
  // }

  async deleteObject(keyOrUrl: string) {
    try {
      // Extraer la key si se proporciona una URL
      let key = keyOrUrl;
      if (keyOrUrl.startsWith('http')) {
        // Extraer la key de la URL
        const urlParts = keyOrUrl.split(`${this.bucketName}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/`);
        if (urlParts.length > 1) {
          key = urlParts[1];
        } else {
          throw S3ServiceError.DeleteFailed('s3.ts', 'deleteObject', 'URL inválida');
        }
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return await this.s3Client.send(command);
    } catch (error: any) {
      throw S3ServiceError.DeleteFailed(
        's3.ts',
        'deleteObject',
        `Error eliminando objeto: ${error.message}`
      );
    }
  }

  getPublicUrl(key: string) {
    if (!key || !this.bucketName || !process.env.AWS_BUCKET_REGION) {
      throw S3ServiceError.InvalidBucketOperation('s3.ts', 'getPublicUrl', `
        ${!key ? 'Key no puede ser vacío' : 'Nombre de bucket o region no configurado'}`);
    }
    return `https://${this.bucketName}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;
  }
}

// Exportar una instancia única para usar en toda la aplicación
export const s3Service = new S3Service();

