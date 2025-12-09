interface ProcessedImageData {
    buffer: Buffer;
    type: string;
  }
  
  export function bufferToFile(
    data: ProcessedImageData, 
    fileName: string
  ): File {
    // Convert Buffer to Uint8Array for Web API compatibility
    const uint8Array = new Uint8Array(data.buffer);
    const blob = new Blob([uint8Array], { type: data.type });
    return new File([blob], fileName, { type: data.type });
  }