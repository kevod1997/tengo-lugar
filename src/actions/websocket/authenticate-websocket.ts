'use server';

import { ServiceError } from '@/lib/exceptions/service-error';
import { ApiHandler } from '@/lib/api-handler';
import { ApiResponse } from '@/types/api-types';

const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL || 'http://localhost:8080';
const WEBSOCKET_USERNAME = process.env.WEBSOCKET_USERNAME || 'demo';
const WEBSOCKET_PASSWORD = process.env.WEBSOCKET_PASSWORD || 'password';
const websocketUserAgent = process.env.WEBSOCKET_USER_AGENT || 'TengoLugar-MainApp';

// Types for WebSocket server API
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
}

export interface WebSocketTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authenticate with the WebSocket server to get access and refresh tokens
 */
export async function authenticateWebSocket(): Promise<ApiResponse<WebSocketTokens>> {
  const fileName = 'authenticate-websocket.ts';
  const functionName = 'authenticateWebSocket';

  console.log('[WS AUTH] Attempting WebSocket authentication...');
  console.log('[WS AUTH] Server URL:', WEBSOCKET_SERVER_URL);
  console.log('[WS AUTH] Username:', WEBSOCKET_USERNAME?.substring(0, 3) + '***');

  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': websocketUserAgent
      },
      body: JSON.stringify({
        username: WEBSOCKET_USERNAME,
        password: WEBSOCKET_PASSWORD,
      }),
    });

    console.log('[WS AUTH] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[WS AUTH] Authentication failed:', response.status, errorData);
      throw ServiceError.ExternalApiError(
        `WebSocket authentication failed: ${errorData.message || response.statusText}`,
        fileName,
        functionName
      );
    }

    const data: LoginResponse = await response.json();
    console.log('[WS AUTH] Authentication successful, tokens received');

    if (!data.accessToken || !data.refreshToken) {
      throw ServiceError.ExternalApiError(
        'Invalid authentication response: missing tokens',
        fileName,
        functionName
      );
    }

    return ApiHandler.handleSuccess(
      {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
      'WebSocket authentication successful'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

/**
 * Refresh the WebSocket access token using the refresh token
 */
export async function refreshWebSocketToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
  const fileName = 'authenticate-websocket.ts';
  const functionName = 'refreshWebSocketToken';

  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': websocketUserAgent
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // If refresh fails with 401, client should re-authenticate
      if (response.status === 401) {
        throw ServiceError.AuthenticationError(fileName, functionName);
      }

      throw ServiceError.ExternalApiError(
        `Token refresh failed: ${errorData.message || response.statusText}`,
        fileName,
        functionName
      );
    }

    const data: RefreshTokenResponse = await response.json();

    if (!data.accessToken) {
      throw ServiceError.ExternalApiError(
        'Invalid refresh response: missing access token',
        fileName,
        functionName
      );
    }

    return ApiHandler.handleSuccess(
      { accessToken: data.accessToken },
      'WebSocket token refreshed successfully'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}