import { useWebSocketContext } from '@/components/providers/WebSocketProvider'

/**
 * Custom hook for WebSocket connection management
 * Provides simple interface to WebSocket functionality
 */
export function useWebSocket() {
  const context = useWebSocketContext()

  return {
    // Connection state
    connectionState: context.connectionState,
    isConnected: context.isConnected,
    isConnecting: context.connectionState === 'connecting',
    isReconnecting: context.connectionState === 'reconnecting',
    hasError: context.connectionState === 'error',
    
    // Actions
    sendMessage: context.sendMessage,
    
    // Service reference (for advanced usage)
    service: context.service
  }
}