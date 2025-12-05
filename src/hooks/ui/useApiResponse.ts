import { toast } from 'sonner';

import type { ApiResponse } from '@/types/api-types';

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