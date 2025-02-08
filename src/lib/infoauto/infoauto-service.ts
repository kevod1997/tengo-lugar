import { Redis } from '@upstash/redis';
import { CAR_API_PASSWORD, CAR_API_URL, CAR_API_USERNAME } from '@/config/car-api';
import { ServiceError } from '@/lib/exceptions/service-error';

const redis = Redis.fromEnv();

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface CarApiError {
  message: string;
  status: number;
  details?: string;
}

export async function getAccessToken(): Promise<string> {
  try {
    const cachedToken = await redis.get<string>('car_api_access_token');
    if (cachedToken) return cachedToken;

    const response = await fetch(`${CAR_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${CAR_API_USERNAME}:${CAR_API_PASSWORD}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw ServiceError.ExternalApiError(
        `Authentication failed: ${response.statusText}`,
        'car-api.ts',
        'getAccessToken'
      );
    }

    const { access_token, refresh_token }: AuthResponse = await response.json();

    await redis.set('car_api_access_token', access_token, { ex: 3000 });
    await redis.set('car_api_refresh_token', refresh_token, { ex: 86400 });

    return access_token;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    
    throw ServiceError.ExternalApiError(
      'Failed to obtain access token',
      'car-api.ts',
      'getAccessToken'
    );
  }
}

export async function refreshAccessToken(): Promise<void> {
  try {
    const refreshToken = await redis.get<string>('car_api_refresh_token');
    if (!refreshToken) {
      throw ServiceError.InvalidOperation(
        'Refresh token not found',
        'car-api.ts',
        'refreshAccessToken'
      );
    }

    const response = await fetch(`${CAR_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    if (!response.ok) {
      throw ServiceError.ExternalApiError(
        `Token refresh failed: ${response.statusText}`,
        'car-api.ts',
        'refreshAccessToken'
      );
    }

    const { access_token }: AuthResponse = await response.json();
    await redis.set('car_api_access_token', access_token, { ex: 3000 });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    
    throw ServiceError.ExternalApiError(
      'Failed to refresh access token',
      'car-api.ts',
      'refreshAccessToken'
    );
  }
}

export async function fetchFromCarApi<T>(endpoint: string): Promise<T> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${CAR_API_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        await refreshAccessToken();
        return fetchFromCarApi<T>(endpoint);
      }

      const errorData: CarApiError = await response.json().catch(() => ({
        message: response.statusText,
        status: response.status
      }));

      throw ServiceError.ExternalApiError(
        `API request failed: ${errorData.message}`,
        'car-api.ts',
        'fetchFromCarApi'
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    
    throw ServiceError.ExternalApiError(
      'Failed to fetch data from car API',
      'car-api.ts',
      'fetchFromCarApi'
    );
  }
}