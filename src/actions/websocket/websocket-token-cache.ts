'use server';

import { redisService } from '@/lib/redis/redis-service';
import { ApiHandler } from '@/lib/api-handler';
import { ApiResponse } from '@/types/api-types';
import { authenticateWebSocket, refreshWebSocketToken } from './authenticate-websocket';

export interface CachedTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Get cached access token or fetch a new one with Redis caching
 * Similar to car-api-service.ts pattern but as Server Action
 */
export async function getCachedAccessToken(): Promise<ApiResponse<{ accessToken: string }>> {

  try {
    // Check for cached token first
    const cachedToken = await redisService.get<string>('websocket_access_token', false);
    if (cachedToken) {
      return ApiHandler.handleSuccess(
        { accessToken: cachedToken },
        'Cached WebSocket token retrieved'
      );
    }

    // If no cached token, authenticate to get new tokens
    const authResult = await authenticateWebSocket();
    if (!authResult.success) {
      return authResult;
    }

    // Cache tokens with safety margins (12min for access, 6.5d for refresh)
    await Promise.all([
      redisService.set('websocket_access_token', authResult.data!.accessToken, { ex: 720 }, false), // 12 minutes (3min safety margin)
      redisService.set('websocket_refresh_token', authResult.data!.refreshToken, { ex: 561600 }, false) // 6.5 days (0.5d safety margin)
    ]);

    return ApiHandler.handleSuccess(
      { accessToken: authResult.data!.accessToken },
      'WebSocket token authenticated and cached'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

/**
 * Refresh WebSocket access token with Redis caching
 */
export async function refreshCachedAccessToken(): Promise<ApiResponse<{ accessToken: string }>> {

  try {
    // Get refresh token from cache
    const refreshToken = await redisService.get<string>('websocket_refresh_token', false);

    if (!refreshToken) {
      // No refresh token available, clear access token and re-authenticate
      await redisService.del('websocket_access_token', false);
      return getCachedAccessToken();
    }

    const refreshResult = await refreshWebSocketToken(refreshToken);

    if (!refreshResult.success) {
      // If refresh fails with authentication error, clear tokens and re-authenticate
      if (refreshResult.error?.code === 'AUTHENTICATION_FAILED') {
        await Promise.all([
          redisService.del('websocket_access_token', false),
          redisService.del('websocket_refresh_token', false)
        ]);
        return getCachedAccessToken();
      }
      return refreshResult;
    }

    // Update cached access token with safety margin
    await redisService.set('websocket_access_token', refreshResult.data!.accessToken, { ex: 720 }, false); // 12 minutes (3min safety margin)

    return ApiHandler.handleSuccess(
      { accessToken: refreshResult.data!.accessToken },
      'WebSocket token refreshed and cached'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

/**
 * Clear cached WebSocket tokens (for logout/cleanup)
 */
export async function clearCachedTokens(): Promise<ApiResponse<void>> {

  try {
    await Promise.all([
      redisService.del('websocket_access_token', false),
      redisService.del('websocket_refresh_token', false)
    ]);

    return ApiHandler.handleSuccess(
      undefined,
      'WebSocket tokens cleared from cache'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}