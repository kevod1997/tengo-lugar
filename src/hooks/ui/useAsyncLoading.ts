import { useLoadingStore, LoadingOperation } from '@/store/loadingStore';
import { toast } from 'sonner';

export function useAsyncLoading() {
  const { startLoading, stopLoading } = useLoadingStore();
  
  // Función para ejecutar operaciones con estado de carga automático
  const executeWithLoading = async <T>(
    operation: LoadingOperation,
    asyncFn: () => Promise<T>,
    options: {
      showToastOnError?: boolean;
      errorMessage?: string;
    } = {}
  ): Promise<T | undefined> => {
    startLoading(operation);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error(`Error en ${operation}:`, error);
      
      if (options.showToastOnError) {
        toast.error(
          options.errorMessage || 
          `Error: ${error instanceof Error ? error.message : 'Algo salió mal'}`
        );
      }
      
      return undefined;
    } finally {
      stopLoading(operation);
    }
  };
  
  return { executeWithLoading };
}