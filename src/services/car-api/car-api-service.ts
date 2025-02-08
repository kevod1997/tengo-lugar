import { Redis } from '@upstash/redis';
import { CAR_API_PASSWORD, CAR_API_URL, CAR_API_USERNAME } from '@/config/car-api';

const redis = Redis.fromEnv();

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export async function getAccessToken(): Promise<string> {
  const cachedToken = await redis.get<string>('car_api_access_token');
  if (cachedToken) return cachedToken;

  const response = await fetch(`${CAR_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${CAR_API_USERNAME}:${CAR_API_PASSWORD}`).toString('base64')}`
    }
  });
  console.log('response', response);
  if (!response.ok) {
    throw new Error('Failed to obtain access token');
  }

  const { access_token, refresh_token }: AuthResponse = await response.json();

  // Cache the access token for 50 minutes (considering it's valid for 1 hour)
  await redis.set('car_api_access_token', access_token, { ex: 3000 });
  await redis.set('car_api_refresh_token', refresh_token, { ex: 86400 }); // 24 hours

  return access_token;
}

export async function refreshAccessToken(): Promise<void> {
  const refreshToken = await redis.get<string>('car_api_refresh_token');
  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const response = await fetch(`${CAR_API_URL}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const { access_token }: AuthResponse = await response.json();

  await redis.set('car_api_access_token', access_token, { ex: 3000 });
}

export async function fetchFromCarApi(endpoint: string): Promise<any> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${CAR_API_URL}/pub${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      await refreshAccessToken();
      return fetchFromCarApi(endpoint);
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

