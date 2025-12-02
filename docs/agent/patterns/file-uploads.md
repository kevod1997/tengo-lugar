# File Upload Patterns

## Overview
Tengo Lugar uses **AWS S3** for file storage with **Sharp** for image processing and **React Dropzone** for file upload UI.

**S3 Service Location**: [src/lib/file/s3-upload.ts](../../../src/lib/file/s3-upload.ts)

---

## Basic Upload Pattern

### Server Action with S3 Upload

```typescript
'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { uploadToS3 } from "@/lib/file/s3-upload";
import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";

export async function uploadProfileImage(formData: FormData) {
  try {
    const session = await requireAuthentication('upload-profile-image.ts', 'uploadProfileImage');

    // Get file from FormData
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    // Upload to S3
    const s3Result = await uploadToS3(
      file,
      `profiles/${session.user.id}`, // S3 key prefix
      'public' // or 'private'
    );

    // Save to database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: s3Result.url
      }
    });

    return ApiHandler.handleSuccess(updatedUser, 'Profile image updated');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
```

---

## Image Processing with Sharp

### Resize and Optimize Before Upload

```typescript
import sharp from "sharp";
import { uploadToS3 } from "@/lib/file/s3-upload";

export async function uploadOptimizedImage(file: File) {
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process with Sharp
  const processedBuffer = await sharp(buffer)
    .resize(800, 600, {
      fit: 'inside', // Maintain aspect ratio
      withoutEnlargement: true // Don't enlarge small images
    })
    .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
    .toBuffer();

  // Create new File from processed buffer
  const processedFile = new File(
    [processedBuffer],
    file.name.replace(/\.[^.]+$/, '.jpg'),
    { type: 'image/jpeg' }
  );

  // Upload to S3
  return await uploadToS3(processedFile, 'images/', 'public');
}
```

### Multiple Image Sizes

```typescript
export async function uploadMultipleSizes(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create thumbnail
  const thumbnail = await sharp(buffer)
    .resize(150, 150, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer();

  // Create medium size
  const medium = await sharp(buffer)
    .resize(400, 400, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Create large size
  const large = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside' })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Upload all sizes
  const [thumbnailResult, mediumResult, largeResult] = await Promise.all([
    uploadToS3(new File([thumbnail], 'thumb.jpg'), 'images/thumb/', 'public'),
    uploadToS3(new File([medium], 'medium.jpg'), 'images/medium/', 'public'),
    uploadToS3(new File([large], 'large.jpg'), 'images/large/', 'public'),
  ]);

  return {
    thumbnail: thumbnailResult.url,
    medium: mediumResult.url,
    large: largeResult.url,
  };
}
```

---

## React Dropzone Integration

### Basic Dropzone Component

```typescript
'use client'

import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { uploadProfileImage } from '@/actions/user/upload-profile-image';
import { toast } from 'sonner';

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);

        const result = await uploadProfileImage(formData);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error?.message);
        }
      } catch (error) {
        toast.error('Error uploading file');
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag & drop an image here, or click to select</p>
      )}
    </div>
  );
}
```

### Dropzone with Preview

```typescript
'use client'

import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import Image from 'next/image';

export function ImageUploadWithPreview() {
  const [preview, setPreview] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
  });

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8">
        <input {...getInputProps()} />
        <p>Click or drag to upload</p>
      </div>

      {preview && (
        <div className="mt-4">
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
```

---

## Multiple File Upload

### Upload Multiple Files

```typescript
export async function uploadMultipleFiles(files: File[]) {
  const session = await requireAuthentication('upload-files.ts', 'uploadMultipleFiles');

  // Upload all files in parallel
  const uploadPromises = files.map((file, index) =>
    uploadToS3(file, `documents/${session.user.id}/${index}`, 'private')
  );

  const results = await Promise.all(uploadPromises);

  // Save to database
  const documents = await prisma.document.createMany({
    data: results.map((result) => ({
      userId: session.user.id,
      s3Key: result.key,
      s3Url: result.url,
      fileName: result.fileName,
    })),
  });

  return ApiHandler.handleSuccess(documents, 'Files uploaded successfully');
}
```

---

## Image Cropping

### React Easy Crop Integration

```typescript
'use client'

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';

export function ImageCropper({ imageSrc }: { imageSrc: string }) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    // Upload croppedImage
  };

  return (
    <div className="relative h-96">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1} // Square crop
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
    </div>
  );
}

// Utility function to crop image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg');
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
```

---

## PDF Processing

### Upload PDF with Metadata

```typescript
import { PDFDocument } from 'pdf-lib';

export async function uploadPDFWithMetadata(file: File) {
  const session = await requireAuthentication('upload-pdf.ts', 'uploadPDFWithMetadata');

  // Read PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Get metadata
  const pageCount = pdfDoc.getPageCount();
  const title = pdfDoc.getTitle();

  // Upload to S3
  const s3Result = await uploadToS3(
    file,
    `documents/${session.user.id}/pdfs`,
    'private'
  );

  // Save to database with metadata
  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      s3Key: s3Result.key,
      s3Url: s3Result.url,
      fileName: file.name,
      fileType: 'PDF',
      pageCount,
      title,
    },
  });

  return ApiHandler.handleSuccess(document, 'PDF uploaded successfully');
}
```

---

## File Validation

### Validate File Type and Size

```typescript
export function validateFile(file: File) {
  // Allowed types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }

  // Max size: 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  return true;
}
```

### Validate Image Dimensions

```typescript
export async function validateImageDimensions(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to read image dimensions');
  }

  // Minimum dimensions: 100x100
  if (metadata.width < 100 || metadata.height < 100) {
    throw new Error('Image too small. Minimum size is 100x100 pixels.');
  }

  // Maximum dimensions: 4000x4000
  if (metadata.width > 4000 || metadata.height > 4000) {
    throw new Error('Image too large. Maximum size is 4000x4000 pixels.');
  }

  return true;
}
```

---

## Presigned URLs

### Generate Presigned URL for Download

```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/file/s3-client';

export async function generateDownloadUrl(s3Key: string) {
  const session = await requireAuthentication('generate-url.ts', 'generateDownloadUrl');

  // Verify user owns the file
  const document = await prisma.document.findFirst({
    where: {
      s3Key,
      userId: session.user.id,
    },
  });

  if (!document) {
    throw ServerActionError.NotFound('generate-url.ts', 'generateDownloadUrl', 'Document not found');
  }

  // Generate presigned URL (expires in 1 hour)
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: s3Key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return ApiHandler.handleSuccess({ url }, 'Download URL generated');
}
```

---

## Best Practices

### 1. Always Validate Files

```typescript
// Validate before upload
validateFile(file);
await validateImageDimensions(file);
```

### 2. Process Images Before Upload

```typescript
// Optimize images to reduce storage costs
const optimized = await sharp(buffer)
  .resize(1200, 1200, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer();
```

### 3. Use Appropriate S3 Paths

```typescript
// Organize by user and type
`users/${userId}/profile/${filename}`
`users/${userId}/documents/${filename}`
`cars/${carId}/photos/${filename}`
```

### 4. Handle Upload Errors Gracefully

```typescript
try {
  await uploadToS3(file, path, 'public');
} catch (error) {
  if (error.name === 'NoSuchBucket') {
    throw new Error('S3 bucket not configured');
  }
  throw error;
}
```

### 5. Clean Up Failed Uploads

```typescript
let s3Result;
try {
  s3Result = await uploadToS3(file, path, 'public');

  const document = await prisma.document.create({
    data: { s3Key: s3Result.key, /* ... */ }
  });
} catch (error) {
  // Delete S3 file if database save fails
  if (s3Result) {
    await deleteFromS3(s3Result.key);
  }
  throw error;
}
```

---

## Related Documentation

- [Server Actions](server-actions.md) - File upload in Server Actions
- [AWS S3 Configuration](../reference/aws-config.md) - S3 setup
