import prisma from "@/lib/prisma"

export interface ErrorLogData {
  origin: string
  code: string
  message: string
  details?: string
  fileName: string
  functionName: string
}

export async function logError(errorData: ErrorLogData) {
  try {
    await prisma.errorLog.create({
      data: errorData
    })
  } catch (error) {
    console.error('Failed to log error to database:', error)
  }
}

