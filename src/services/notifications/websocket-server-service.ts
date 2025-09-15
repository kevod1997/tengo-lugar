import { WebSocketNotificationPayload } from "@/types/notification-types"
import { ServiceError } from "@/lib/exceptions/service-error"

/**
 * Server-side WebSocket notification service
 * This service is specifically designed to run on the server-side
 * without client-side dependencies or conflicts
 */
export class WebSocketServerService {
  
  /**
   * Send notification payload to WebSocket server via REST API
   * This method runs server-side only and handles all networking
   */
  static async sendNotificationPayload(payload: WebSocketNotificationPayload): Promise<boolean> {
    try {
      // Get environment variables
      const webSocketServerUrl = process.env.WEBSOCKET_SERVER_URL
      const webSocketUsername = process.env.WEBSOCKET_USERNAME
      const webSocketPassword = process.env.WEBSOCKET_PASSWORD
      const websocketUserAgent = process.env.WEBSOCKET_USER_AGENT || 'TengoLugar-MainApp'
      
      // Validate environment configuration
      if (!webSocketServerUrl || !webSocketUsername || !webSocketPassword) {
        console.warn('WebSocket configuration missing, skipping notification')
        return false
      }
      
      // Create Basic Auth header
      const credentials = Buffer.from(`${webSocketUsername}:${webSocketPassword}`).toString('base64')
      
      // Create fetch request with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${webSocketServerUrl}/api/notifications/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'User-Agent': websocketUserAgent
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        console.error(`WebSocket notification failed: ${response.status} ${response.statusText}`)
        return false
      }
      
      return true
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('WebSocket notification timeout')
      } else {
        console.error('WebSocket notification error:', error instanceof Error ? error.message : 'Unknown error')
      }
      return false
    }
  }
  
  /**
   * Test WebSocket server connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      const webSocketServerUrl = process.env.WEBSOCKET_SERVER_URL
      if (!webSocketServerUrl) {
        return false
      }
      
      const response = await fetch(`${webSocketServerUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      
      return response.ok
    } catch {
      return false
    }
  }
}