'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages } from '@/hooks/chat/useMessages';
import { WebSocketMessage } from '@/services/chat/websocket-service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/chat/useAuth';
import { useWebSocket } from '@/hooks/chat/useWebSockets';

interface ChatRoomProps {
  roomId: string;
  initialMessages?: any[];
}

export function ChatRoom({ roomId, initialMessages = [] }: ChatRoomProps) {
  const { token, userId, isLoading: isAuthLoading, error: authError, refreshToken } = useAuth();
  const [hasRetriedAuth, setHasRetriedAuth] = useState(false);

  const {
    messages,
    isLoadingHistory,
    hasMoreHistory,
    pendingMessages,
    loadHistory,
    addMessage,
    addLocalMessage,
    savePendingMessage,
    updateLocalMessage,
    // removeLocalMessage,
    retryPendingMessages
  } = useMessages({
    roomId,
    token,
    userId,
    initialMessages
  });

  const handleMessage = useCallback((wsMessage: WebSocketMessage) => {
    // Si es nuestro propio mensaje, actualizar el mensaje local
    if (wsMessage.user_id === userId && wsMessage.type === 'message') {
      // Buscar si hay un mensaje local pendiente con el mismo contenido
      const localMessage = messages.find(
        msg => msg.isLocal && msg.content === wsMessage.content
      );
      
      if (localMessage && localMessage.id) {
        updateLocalMessage(localMessage.id, wsMessage);
        return;
      }
    }
    
    // Si no, agregar como mensaje nuevo
    addMessage(wsMessage);
  }, [userId, messages, updateLocalMessage, addMessage]);

  const {
    status,
    // isReconnecting,
    reconnectInfo,
    sendMessage: wsSendMessage,
    isConnected
  } = useWebSocket({
    roomId,
    token,
    onMessage: handleMessage,
    autoConnect: true
  });

  // Cargar historial inicial cuando se conecte
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      loadHistory();
    }
  }, [isConnected, loadHistory, messages.length]);

  // Reintentar mensajes pendientes cuando se reconecte
  useEffect(() => {
    if (isConnected && pendingMessages.length > 0) {
      retryPendingMessages(wsSendMessage);
    }
  }, [isConnected, pendingMessages, retryPendingMessages, wsSendMessage]);

  const handleSendMessage = useCallback((content: string): boolean => {
    if (!isConnected) {
      // Guardar mensaje para enviar después
      const tempId = addLocalMessage(content);
      savePendingMessage(tempId, content);
      toast.info('Mensaje guardado. Se enviará cuando te reconectes.');
      return true;
    }

    const tempId = addLocalMessage(content);
    const success = wsSendMessage(content);
    
    if (!success) {
      // Si falla el envío, guardar como pendiente
      savePendingMessage(tempId, content);
      toast.error('Error al enviar. Se reintentará automáticamente.');
    }
    
    return success;
  }, [isConnected, addLocalMessage, savePendingMessage, wsSendMessage]);

  const handleRetryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    if (isConnected) {
      const success = wsSendMessage(message.content);
      if (!success) {
        toast.error('No se pudo reenviar el mensaje');
      }
    } else {
      toast.info('Esperando conexión para reenviar');
    }
  }, [messages, isConnected, wsSendMessage]);

  const handleRetryAuth = useCallback(async () => {
    setHasRetriedAuth(true);
    await refreshToken();
  }, [refreshToken]);

  // Manejar errores de autenticación
  if (authError && !hasRetriedAuth) {
    return (
      <Card className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-full p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {authError}
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleRetryAuth}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chat del viaje</h2>
        <ConnectionStatus status={status} reconnectInfo={reconnectInfo} />
      </div>

      {/* Lista de mensajes */}
      <MessageList
        messages={messages}
        isLoadingHistory={isLoadingHistory}
        hasMoreHistory={hasMoreHistory}
        onLoadMore={() => {
          const oldestMessage = messages[0];
          if (oldestMessage?.id) {
            loadHistory(oldestMessage.id);
          }
        }}
        onRetryMessage={handleRetryMessage}
      />

      {/* Input de mensaje */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        disabled={isAuthLoading || !!authError}
        placeholder={
          pendingMessages.length > 0
            ? `${pendingMessages.length} mensaje(s) pendiente(s)...`
            : "Escribe tu mensaje..."
        }
      />
    </Card>
  );
}