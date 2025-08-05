import { getCarApiConfig } from '../env/env-service';
import { redisService } from '@/lib/redis/redis-service';
import { ConfigurationError } from '@/lib/exceptions/configuration-error';
import { ServiceError } from '@/lib/exceptions/service-error';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export async function getAccessToken(): Promise<string> {
  try {
    const cachedToken = await redisService.get<string>('car_api_access_token', false)
    if (cachedToken) return cachedToken;

    const carApiConfig = getCarApiConfig()
    if (!carApiConfig.available) {
      throw ConfigurationError.ServiceUnavailable(
        'Car API',
        'car-api-service.ts',
        'getAccessToken'
      )
    }

    const { url, username, password } = getCarApiConfig()

    const response = await fetch(`${url}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw ServiceError.ExternalApiError(
        `Car API login failed: ${response.status} ${errorText}`,
        'car-api-service.ts',
        'getAccessToken'
      )
    }

    const { access_token, refresh_token }: AuthResponse = await response.json();

    // Intentar cachear tokens (no crítico si falla)
    await Promise.all([
      redisService.set('car_api_access_token', access_token, { ex: 3000 }, false),
      redisService.set('car_api_refresh_token', refresh_token, { ex: 86400 }, false)
    ]);

    return access_token;
  } catch (error) {
    throw error;
  }
}

export async function refreshAccessToken(): Promise<void> {
  try {
    const refreshToken = await redisService.get<string>('car_api_refresh_token', false)

    if (!refreshToken) {
      await redisService.del('car_api_access_token', false)
      throw ServiceError.ExternalApiError(
        'Refresh token not found',
        'car-api-service.ts',
        'refreshAccessToken'
      )
    }

    const carApiConfig = getCarApiConfig()
    if (!carApiConfig.available) {
      throw ConfigurationError.ServiceUnavailable(
        'Car API',
        'car-api-service.ts',
        'refreshAccessToken'
      )
    }

    const response = await fetch(`${carApiConfig.url}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401 || response.status === 422) {
        await Promise.all([
          redisService.del('car_api_access_token', false),
          redisService.del('car_api_refresh_token', false)
        ]);
      }

      throw ServiceError.ExternalApiError(
        `Failed to refresh token: ${response.status} ${errorText}`,
        'car-api-service.ts',
        'refreshAccessToken'
      )
    }

    const { access_token }: AuthResponse = await response.json();
    await redisService.set('car_api_access_token', access_token, { ex: 3000 }, false)
  } catch (error) {
    throw error;
  }
}

export async function fetchFromCarApi(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  retryCount = 0
): Promise<any> {
  const MAX_RETRIES = 1;

  try {
    const accessToken = await getAccessToken();
    const carApiConfig = getCarApiConfig()

    const response = await fetch(`${carApiConfig.url}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 && retryCount < MAX_RETRIES) {
        await redisService.del('car_api_access_token', false)
        await refreshAccessToken();
        return fetchFromCarApi(endpoint, method, retryCount + 1);
      }

      const errorText = await response.text();
      throw ServiceError.ExternalApiError(
        `Car API request failed: ${response.status} ${errorText}`,
        'car-api-service.ts',
        'fetchFromCarApi'
      )
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
