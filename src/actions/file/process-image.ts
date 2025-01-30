'use server'

import { processImage } from "@/lib/file/images/process-image";
import { AuxiliaryError } from "@/lib/exceptions/auxiliary-error";

export async function processImageAction(file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = await processImage(buffer);
    
    return { 
      success: true, 
      data: {
        base64Data,
        type: 'image/jpeg',
        fileName: file.name
      }
    };
  } catch (error) {
    if (error instanceof AuxiliaryError) {
      throw error;
    }
    
    throw AuxiliaryError.ImageProcessingFailed(
      'process-image.ts',
      'processImageAction',
      error instanceof Error ? error.message : 'Error desconocido procesando imagen'
    );
  }
}