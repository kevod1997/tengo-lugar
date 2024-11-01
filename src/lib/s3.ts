import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME!;
  }

  private getObjectKey(type: 'profile' | 'identity', fileName: string) {
    const prefix = type === 'profile' ? 'public/profile-images' : 'private/identity';
    return `${prefix}/${fileName}`;
  }

  async getSignedUploadUrl(
    type: 'profile' | 'identity',
    fileName: string,
    contentType: string,
    expiresIn: number = 3600
  ) {
    const key = this.getObjectKey(type, fileName);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return { signedUrl, key };
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await this.s3Client.send(command);
  }

  getPublicUrl(key: string) {
    return `https://${this.bucketName}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;
  }
}

// Exportar una instancia única para usar en toda la aplicación
export const s3Service = new S3Service();