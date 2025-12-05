import sharp from 'sharp';

import { AuxiliaryError } from '@/lib/exceptions/auxiliary-error';

const MAX_PROCESSED_SIZE = 2 * 1024 * 1024; // 2MB
const MIN_QUALITY = 40;

export async function processImage(buffer: Buffer) {
  try {
    let processedBuffer = await sharp(buffer)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 }) 
      .toBuffer();

    let quality = 75;
    while (processedBuffer.length > MAX_PROCESSED_SIZE && quality > MIN_QUALITY) {
      processedBuffer = await sharp(buffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality,
          progressive: true
        })
        .toBuffer();
      
      quality -= 5;
    }

    if (processedBuffer.length > MAX_PROCESSED_SIZE) {
      throw AuxiliaryError.ImageProcessingFailed(
        'process-image.ts',
        'processImage',
        'No se pudo optimizar la imagen al tamaño requerido'
      );
    }

    return processedBuffer.toString('base64');

  } catch (error) {
    if (error instanceof AuxiliaryError) {
      throw error;
    }
    
    throw AuxiliaryError.ImageProcessingFailed(
      'process-image.ts',
      'processImage',
      error instanceof Error ? error.message : 'Error desconocido procesando imagen'
    );
  }
}