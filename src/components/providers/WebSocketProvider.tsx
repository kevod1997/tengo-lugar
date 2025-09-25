'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { websocketNotificationService } from '@/services/websocket/websocket-notification-service'
import { useUserStore } from '@/store/user-store'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleUserStateUpdate } from '@/services/websocket/user-state-handler'

// WebSocket connection states
type WebSocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'

interface WebSocketContextType {
  connectionState: WebSocketConnectionState
  isConnected: boolean
  sendMessage: (message: object) => void
  service: typeof websocketNotificationService
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>('disconnected')
  const { user, updateUser } = useUserStore()
  const queryClient = useQueryClient()
  const isAuthenticated = !!user

  const isConnected = connectionState === 'connected'

  const sendMessage = (message: object) => {
    if (isConnected) {
      websocketNotificationService.send(message)
    }
  }

  useEffect(() => {
    // Set up event listeners
    const handleConnected = () => {
      setConnectionState('connected')
    }

    const handleDisconnected = () => {
      setConnectionState('disconnected')
    }

    const handleError = () => {
      setConnectionState('error')
    }

    const handleReconnecting = () => {
      setConnectionState('reconnecting')
    }

    // 🎯 CENTRALIZED WebSocket message handler
    const handleMessage = async (data: any) => {
      
      // Verify message is for current user
      if (data.payload?.userId) {
        return // Ignore messages for other users
      }

      if (data.type === 'notification' && data.payload) {
        
        // 1. Show toast notification (moved from NotificationButton)
        if (data.payload.title && data.payload.message) {
          toast.success(`${data.payload.title}: ${data.payload.message}`)
        }
        
        // 2. Invalidate notifications cache (better than direct refetch)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        
        // 3. Update user state based on eventType
        if (data.eventType) {
          console.log('WebSocket event received:', data.eventType, data.payload)
          handleUserStateUpdate(data, updateUser, user)
        }
      }
    }

    // Add event listeners
    websocketNotificationService.on('connected', handleConnected)
    websocketNotificationService.on('disconnected', handleDisconnected)
    websocketNotificationService.on('error', handleError)
    websocketNotificationService.on('reconnecting', handleReconnecting)
    websocketNotificationService.on('message', handleMessage)

    // Cleanup event listeners on unmount
    return () => {
      websocketNotificationService.off('connected', handleConnected)
      websocketNotificationService.off('disconnected', handleDisconnected)
      websocketNotificationService.off('error', handleError)
      websocketNotificationService.off('reconnecting', handleReconnecting)
      websocketNotificationService.off('message', handleMessage)
    }
  }, [updateUser, queryClient, user])

  useEffect(() => {
    if (isAuthenticated && connectionState === 'disconnected') {
      // Connect when user is authenticated
      setConnectionState('connecting')
      websocketNotificationService.connectWithRetry().catch((error) => {
        console.log('WebSocket connection error:', error)
        setConnectionState('error')
      })
    } else if (!isAuthenticated && isConnected) {
      // Disconnect when user logs out
      websocketNotificationService.disconnect()
      setConnectionState('disconnected')
    }
  }, [isAuthenticated, connectionState, isConnected])

  const contextValue: WebSocketContextType = {
    connectionState,
    isConnected,
    sendMessage,
    service: websocketNotificationService
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}