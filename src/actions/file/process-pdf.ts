'use server'

import { analyzePDF } from "@/lib/file/pdf/analyze-pdf";
import { AuxiliaryError } from "@/lib/exceptions/auxiliary-error";

export async function processPDFAction(file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const analysisResult = await analyzePDF(buffer);
    
    if (!analysisResult.isValid) {
      throw AuxiliaryError.FileAnalysisFailed(
        'process-pdf.ts',
        'processPDFAction',
        'PDF inseguro: ' + analysisResult.threats.join(', ')
      );
    }

    const base64Data = buffer.toString('base64');

    return { 
      success: true, 
      data: {
        base64Data,
        metadata: analysisResult.metadata,
        type: 'application/pdf',
        fileName: file.name
      }
    };

  } catch (error) {
    if (error instanceof AuxiliaryError) {
      throw error;
    }
    
    throw AuxiliaryError.FileAnalysisFailed(
      'process-pdf.ts',
      'processPDFAction',
      error instanceof Error ? error.message : 'Error desconocido procesando PDF'
    );
  }
}