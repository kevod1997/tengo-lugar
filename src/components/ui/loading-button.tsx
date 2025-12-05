import { Loader2 } from 'lucide-react';

import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import type { LoadingOperation } from '@/store/loadingStore';
import { useLoadingStore } from '@/store/loadingStore';


interface LoadingButtonProps extends ButtonProps {
  operation: LoadingOperation;
  loadingText?: string;
}

export function LoadingButton({ 
  operation, 
  loadingText,
  children, 
  ...props 
}: LoadingButtonProps) {
const isLoading: boolean = useLoadingStore((state: { isLoading: (operation: LoadingOperation) => boolean }) => state.isLoading(operation));
const defaultMessage: string = useLoadingStore((state: { getLoadingMessage: (operation: LoadingOperation) => string }) => state.getLoadingMessage(operation));
  
  return (
    <Button 
      disabled={isLoading || props.disabled} 
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || defaultMessage}
        </>
      ) : (
        children
      )}
    </Button>
  );
}