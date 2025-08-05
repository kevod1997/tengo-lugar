import { createActionLogAction } from "@/actions/logs/create-action-log"
import { createErrorLogAction } from "@/actions/logs/create-error-log"
import { TipoAccionUsuario } from "@/types/actions-logs"

// Tipos para los logs
export interface ErrorLogData {
  origin: string
  code: string
  message: string
  details?: string
  fileName: string
  functionName: string
}

export interface ActionLogData {
  userId: string
  action: TipoAccionUsuario
  status: 'SUCCESS' | 'FAILED'
  details?: Record<string, any>
}

export class LoggingService {

  private static async handleLoggingError(error: unknown, context: {
    operation: string;
    fileName: string;
    functionName: string;
  }) {
    try {
      await createErrorLogAction({
        origin: 'Logging Service',
        code: 'LOGGING_ERROR',
        message: `Error al ${context.operation}`,
        details: error instanceof Error ? error.message : String(error),
        fileName: context.fileName,
        functionName: context.functionName
      });
    } catch (error) {
      // Solo log en consola si falla el logging de error
      console.log('Critical: Failed to log error:', error);
    }
  }

  static async logActionWithErrorHandling(
    actionData: ActionLogData,
    context: { fileName: string; functionName: string }
  ) {
    try {
      await createActionLogAction(actionData);
    } catch (error) {
      await LoggingService.handleLoggingError(error, {
        operation: `registrar acción ${actionData.action}`,
        ...context
      });
    }
  }

  static async logError(errorData: ErrorLogData) {
    try {
      await createErrorLogAction(errorData);
    } catch (error) {
      console.log('Critical: Failed to log error:', error);
    }
  }
}

// Exportar función helper para retrocompatibilidad
export const logError = LoggingService.logError
export const logActionWithErrorHandling = LoggingService.logActionWithErrorHandling