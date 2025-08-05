import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';
import { MAX_FILE_SIZE } from '@/config/constants';
import { AuxiliaryError } from '@/lib/exceptions/auxiliary-error';

interface PDFAnalysisResult {
  isValid: boolean;
  threats: string[];
  metadata: {
    pageCount: number;
    hasJavaScript: boolean;
    hasEncryption: boolean;
    fileSize: number;
    hash: string;
  };
}

// Constantes para la configuración
const FORBIDDEN_PATTERNS = [
  /%JS/i,          // JavaScript header
  /OpenAction/,    // Automatic actions
  /Launch/,        // External program execution
  /JavaScript/i,   // JavaScript content
  /RichMedia/,     // Multimedia content
  /XFA/,          // XML Forms Architecture
] as const;

// Función principal de análisis
export async function analyzePDF(fileBuffer: Buffer): Promise<PDFAnalysisResult> {
  try {
    const threats: string[] = [];
    
    if (fileBuffer.length > MAX_FILE_SIZE) {
      threats.push('El archivo excede el límite de tamaño permitido');
    }

    const hash = generateFileHash(fileBuffer);
    const pdfDoc = await loadPDFDocument(fileBuffer);
    const metadata = await extractPDFMetadata(pdfDoc);
    
    const suspiciousPatterns = detectSuspiciousPatterns(fileBuffer);
    threats.push(...suspiciousPatterns);

    return {
      isValid: threats.length === 0,
      threats,
      metadata: {
        ...metadata,
        fileSize: fileBuffer.length,
        hash,
      },
    };
  } catch (error) {
    throw AuxiliaryError.FileAnalysisFailed(
      'analyze-pdf.ts',
      'analyzePDF',
      (error instanceof Error ? error.message : 'Ocurrió un error desconocido al analizar el archivo')
    );
  }
}

// Funciones auxiliares
function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function loadPDFDocument(buffer: Buffer) {
  return await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    updateMetadata: false
  });
}

async function extractPDFMetadata(pdfDoc: PDFDocument) {
  const pageCount = pdfDoc.getPageCount();
  const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
  const hasJavaScript = detectJavaScript(catalog);
  const hasEncryption = pdfDoc.isEncrypted;

  return {
    pageCount,
    hasJavaScript,
    hasEncryption
  };
}

function detectSuspiciousPatterns(buffer: Buffer): string[] {
  const threats: string[] = [];
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 5000));
  
  FORBIDDEN_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      threats.push(`Patrón sospechoso detectado: ${pattern}`);
    }
  });

  return threats;
}

function detectJavaScript(catalog: any): boolean {
  try {
    const names = catalog.get('Names');
    const javascript = names?.get('JavaScript');
    return !!javascript;
  } catch {
    return false;
  }
}