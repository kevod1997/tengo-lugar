interface ProcessedImageData {
    buffer: Buffer;
    type: string;
  }
  
  export function bufferToFile(
    data: ProcessedImageData, 
    fileName: string
  ): File {
    const blob = new Blob([data.buffer]);
    return new File([blob], fileName, { type: data.type });
  }