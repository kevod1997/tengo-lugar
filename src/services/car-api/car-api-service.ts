import { Redis } from '@upstash/redis';
import { CAR_API_PASSWORD, CAR_API_URL, CAR_API_USERNAME } from '@/config/car-api-config';

const redis = Redis.fromEnv();

interface AuthResponse {
  access_token: string;
  refresh_token: string;
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
      const errorText = await response.text();
      console.error('Login error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to obtain access token: ${response.status} ${errorText}`);
    }

    const { access_token, refresh_token }: AuthResponse = await response.json();

    await Promise.all([
      redis.set('car_api_access_token', access_token, { ex: 3000 }),
      redis.set('car_api_refresh_token', refresh_token, { ex: 86400 })
    ]);

    return access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function refreshAccessToken(): Promise<void> {
  console.log('Refreshing access token');
  const refreshToken = await redis.get<string>('car_api_refresh_token');

  if (!refreshToken) {
    await redis.del('car_api_access_token');
    throw new Error('Refresh token not found');
  }

  try {
    const response = await fetch(`${CAR_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
      // Add the request body with the refresh token
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Refresh token error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });

      if (response.status === 401 || response.status === 422) {
        await Promise.all([
          redis.del('car_api_access_token'),
          redis.del('car_api_refresh_token')
        ]);
      }

      throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
    }

    const { access_token }: AuthResponse = await response.json();
    await redis.set('car_api_access_token', access_token, { ex: 3000 });
  } catch (error) {
    console.error('Error refreshing token:', error);
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
    const response = await fetch(`${CAR_API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 && retryCount < MAX_RETRIES) {
        await redis.del('car_api_access_token');
        await refreshAccessToken();
        return fetchFromCarApi(endpoint, method, retryCount + 1);
      }

      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error in fetchFromCarApi:', error);
    throw error;
  }
}
