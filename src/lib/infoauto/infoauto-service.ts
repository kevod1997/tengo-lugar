import { Redis } from '@upstash/redis';
import { INFOAUTO_API_URL, INFOAUTO_USERNAME, INFOAUTO_PASSWORD } from './infoauto-config';

const redis = Redis.fromEnv();

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export async function getAccessToken(): Promise<string> {
  const cachedToken = await redis.get<string>('infoauto_access_token');
  if (cachedToken) return cachedToken;

  const response = await fetch(`${INFOAUTO_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${INFOAUTO_USERNAME}:${INFOAUTO_PASSWORD}`).toString('base64')}`
    }
  });
  console.log('response', response);
  if (!response.ok) {
    throw new Error('Failed to obtain access token');
  }

  const { access_token, refresh_token }: AuthResponse = await response.json();

  // Cache the access token for 50 minutes (considering it's valid for 1 hour)
  await redis.set('infoauto_access_token', access_token, { ex: 3000 });
  await redis.set('infoauto_refresh_token', refresh_token, { ex: 86400 }); // 24 hours

  return access_token;
}

export async function refreshAccessToken(): Promise<void> {
  const refreshToken = await redis.get<string>('infoauto_refresh_token');
  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const response = await fetch(`${INFOAUTO_API_URL}/auth/refresh`, {
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

  await redis.set('infoauto_access_token', access_token, { ex: 3000 });
}

export async function fetchFromInfoAuto(endpoint: string): Promise<any> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${INFOAUTO_API_URL}/pub${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      await refreshAccessToken();
      return fetchFromInfoAuto(endpoint);
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

