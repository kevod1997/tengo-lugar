import { processPDFAction } from "@/actions/file/process-pdf";
import { processImageAction } from "@/actions/file/process-image";
import { AuxiliaryError } from "@/lib/exceptions/auxiliary-error";

export interface ProcessedFile {
  file: File;
  preview: string | null;
}

export async function processFile(file: File): Promise<ProcessedFile> {
  
  try {

    const processResult = file.type === 'application/pdf'
      ? await processPDFAction(file)
      : await processImageAction(file);

    const preview = processResult.data.base64Data
      ? `data:${processResult.data.type};base64,${processResult.data.base64Data}`
      : null;

    const binaryData = processResult.data.base64Data
      ? Buffer.from(processResult.data.base64Data, 'base64')
      : null;

    if (!binaryData) {
      throw AuxiliaryError.FileProcessingFailed(
        'file-processor.ts',
        'processFile',
        'Error procesando datos del archivo'
      );
    }

    const processedFile = new File(
      [binaryData],
      processResult.data.fileName || file.name,
      { type: processResult.data.type }
    );

    return {
      file: processedFile,
      preview
    };
  } catch (error) {
    if (error instanceof AuxiliaryError) {
      throw error;
    }
    
    throw AuxiliaryError.FileProcessingFailed(
      'file-processor.ts',
      'processFile',
      error instanceof Error ? error.message : 'Error desconocido procesando archivo'
    );
  }
}