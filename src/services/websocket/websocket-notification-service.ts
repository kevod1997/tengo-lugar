'use client';

import { getUserId } from '@/actions/websocket/get-user-id';
import { getCachedAccessToken, refreshCachedAccessToken } from '@/actions/websocket/websocket-token-cache';
import { ServiceError } from '@/lib/exceptions/service-error';

const WEBSOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL || 'http://localhost:8080';

// Types for WebSocket messages
import type { WebSocketNotificationPayload } from '@/types/notification-types';

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp?: Date;
}

// Event types for the service
type WebSocketEvent = 'connected' | 'disconnected' | 'message' | 'error' | 'reconnecting';

export class WebSocketNotificationService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private websocket: WebSocket | null = null;
  private listeners: Map<WebSocketEvent, Array<(data?: unknown) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private isAuthenticated = false;

  constructor() {
    // Initialize event listeners map
    this.listeners.set('connected', []);
    this.listeners.set('disconnected', []);
    this.listeners.set('message', []);
    this.listeners.set('error', []);
    this.listeners.set('reconnecting', []);
  }

  /**
   * Get cached access token (from Server Action with Redis cache)
   */
  async getAccessToken(): Promise<string> {
    const fileName = 'websocket-notification-service.ts';
    const functionName = 'getAccessToken';

    try {
      // Use Server Action that handles Redis caching
      const response = await getCachedAccessToken();

      if (!response.success) {
        this.isAuthenticated = false;
        throw ServiceError.ExternalApiError(
          `Failed to get WebSocket access token: ${response.error?.message || 'Unknown error'}`,
          fileName,
          functionName
        );
      }

      // Store token in memory for this session
      this.accessToken = response.data!.accessToken;
      this.isAuthenticated = true;

      return this.accessToken;
    } catch (error) {
      this.isAuthenticated = false;
      if (error instanceof ServiceError) {
        throw error;
      }
      throw ServiceError.ExternalApiError(
        `Error getting WebSocket access token: ${(error as Error).message}`,
        fileName,
        functionName
      );
    }
  }


  /**
   * Refresh the access token using Server Action with Redis cache
   */
  async refreshAccessToken(): Promise<void> {
    const fileName = 'websocket-notification-service.ts';
    const functionName = 'refreshAccessToken';

    try {
      // Use Server Action that handles Redis caching and token refresh
      const response = await refreshCachedAccessToken();

      if (!response.success) {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.refreshToken = null;
        throw ServiceError.ExternalApiError(
          `Token refresh failed: ${response.error?.message || 'Unknown error'}`,
          fileName,
          functionName
        );
      }

      // Store refreshed token in memory for this session
      this.accessToken = response.data!.accessToken;
      this.isAuthenticated = true;

    } catch (error) {
      this.isAuthenticated = false;
      if (error instanceof ServiceError) {
        throw error;
      }
      throw ServiceError.ExternalApiError(
        `Error during token refresh: ${(error as Error).message}`,
        fileName,
        functionName
      );
    }
  }

  /**
   * Connect to WebSocket with token refresh retry logic
   */
  async connectWithRetry(retryCount = 0): Promise<void> {
    const MAX_RETRIES = 1;

    try {
      await this.connect();
    } catch (error) {
      // If connection fails and we haven't retried yet, try refreshing token
      if (retryCount < MAX_RETRIES) {
        try {
          await this.refreshAccessToken();
          return this.connectWithRetry(retryCount + 1);
        } catch {
        }
      }
      throw error;
    }
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log('[WS CLIENT] Connection already in progress...');
      return;
    }

    if (this.websocket?.readyState === WebSocket.OPEN) {
      console.log('[WS CLIENT] WebSocket already connected');
      return;
    }

    console.log('[WS CLIENT] Starting WebSocket connection...');
    this.isConnecting = true;

    try {
      // Ensure we have valid tokens and user ID
      console.log('[WS CLIENT] Getting access token...');
      const accessToken = await this.getAccessToken();
      const userId = await getUserId();

      const wsUrl = `${WEBSOCKET_SERVER_URL.replace('http', 'ws')}?token=${accessToken}&userId=${userId}`;
      console.log('[WS CLIENT] WEBSOCKET_SERVER_URL:', WEBSOCKET_SERVER_URL);
      console.log('[WS CLIENT] Connecting to:', WEBSOCKET_SERVER_URL.replace('http', 'ws'));
      console.log('[WS CLIENT] User ID:', userId);
      console.log('[WS CLIENT] Full WebSocket URL:', wsUrl);

      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('[WS CLIENT] WebSocket connection established successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.emit('connected');
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.emit('message', message);
        } catch (error) {
          this.emit('error', { type: 'parse_error', error: error });
        }
      };

      this.websocket.onclose = (event) => {
        console.log('[WS CLIENT] WebSocket connection closed:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Attempt reconnection unless it was a clean close
        if (event.code !== 1000) {
          console.log('[WS CLIENT] Unexpected close, attempting reconnection...');
          this.handleReconnection();
        }
      };

      this.websocket.onerror = (error) => {
        console.error('[WS CLIENT] WebSocket connection error:', error);
        this.isConnecting = false;
        this.emit('error', { type: 'connection_error', error });
      };

    } catch (error) {
      this.isConnecting = false;
      this.emit('error', { type: 'connection_failed', error });
      throw error;
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close(1000, 'Manual disconnect');
      this.websocket = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message through the WebSocket connection
   */
  send(message: object): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.websocket.send(JSON.stringify(message));
    } catch (error) {
      this.emit('error', { type: 'send_error', error });
    }
  }

  /**
   * Add event listener
   */
  on(event: WebSocketEvent, callback: (data?: unknown) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event: WebSocketEvent, callback: (data?: unknown) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(event: WebSocketEvent, data?: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch {
        }
      });
    }
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('error', { type: 'max_reconnect_attempts', attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay: this.reconnectDelay });


    setTimeout(async () => {
      try {
        await this.connectWithRetry();
      } catch {
        // Exponential backoff: double the delay, max 30 seconds
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        this.handleReconnection();
      }
    }, this.reconnectDelay);
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    if (!this.websocket) return 'disconnected';
    
    switch (this.websocket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get authentication status
   */
  isAuthenticatedStatus(): boolean {
    return this.isAuthenticated && !!this.accessToken;
  }

  /**
   * Send notification payload to WebSocket server
   * This method is for server-side use via fetch API
   */
  static async sendNotificationPayload(payload: WebSocketNotificationPayload): Promise<boolean> {
    const webSocketServerUrl = process.env.WEBSOCKET_SERVER_URL;
    const webSocketUsername = process.env.WEBSOCKET_USERNAME;
    const webSocketPassword = process.env.WEBSOCKET_PASSWORD;
    const websocketUserAgent = process.env.WEBSOCKET_USER_AGENT || 'TengoLugar-MainApp';

    if (!webSocketServerUrl || !webSocketUsername || !webSocketPassword) {
      console.warn('WebSocket configuration missing, skipping WebSocket notification');
      return false;
    }

    try {
      const response = await fetch(`${webSocketServerUrl}/api/notifications/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${webSocketUsername}:${webSocketPassword}`).toString('base64')}`,
          'User-Agent': websocketUserAgent
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`WebSocket notification failed: ${response.status} ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('WebSocket notification failed:', error);
      return false;
    }
  }
}

/**
 * WEBSOCKET NOTIFICATION SERVICE WITH REDIS CACHE
 * 
 * This service implements a client-side WebSocket manager that uses Server Actions
 * for Redis-cached token management:
 * 
 * 1. Token Management:
 *    - Server Actions handle Redis cache (getCachedAccessToken, refreshCachedAccessToken)
 *    - Client only stores tokens in memory for session
 *    - Access tokens: 12min cache (3min safety margin from 15min server expiry)
 *    - Refresh tokens: 6.5d cache (0.5d safety margin from 7d server expiry)
 * 
 * 2. Architecture:
 *    - Client: WebSocket connection management, memory-based token storage
 *    - Server Actions: Redis cache operations, token refresh logic
 *    - Similar pattern to car-api-service.ts but client/server separated
 * 
 * 3. Benefits:
 *    - No Redis client-side dependency issues
 *    - Reduces REST calls to WebSocket microservice
 *    - Automatic token refresh on connection failure
 *    - Safe TTL margins prevent using expired tokens
 */

// Export a singleton instance
export const websocketNotificationService = new WebSocketNotificationService();