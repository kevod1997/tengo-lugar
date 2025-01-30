export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
      message: string;
      code: string;
      origin?: string;
    };
  };

  export const createSuccessResponse = <T>(data?: T, message?: string): ApiResponse<T> => ({
    success: true,
    data,
    message
  });
