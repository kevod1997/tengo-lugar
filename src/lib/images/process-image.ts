import sharp from 'sharp';

export async function processImage(buffer: Buffer) {
    try {
      // Procesar la imagen con sharp
      const processedBuffer = await sharp(buffer)
        .resize(1200, 1200, { // Tamaño máximo manteniendo aspecto
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 }) // Convertir a JPEG con calidad 80
        .toBuffer();
  
      return processedBuffer;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Error al procesar la imagen');
    }
  }