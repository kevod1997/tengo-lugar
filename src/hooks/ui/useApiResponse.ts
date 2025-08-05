import { ApiResponse } from '@/types/api-types';
import { toast } from 'sonner';

export function useApiResponse() {
  const handleResponse = <T>(response: ApiResponse<T>) => {

      if (response.success) {
          toast.success('¡Éxito!', { 
              description: response.message 
          });
          return;
      }

      toast.error('Error', {
          description: response.message
      });
  };

  return { handleResponse };
}