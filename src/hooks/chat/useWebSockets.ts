import { WebSocketMessage, WebSocketService } from '@/services/chat/websocket-service';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export type ConnectionStatus = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'authError' 
  | 'error'
  | 'reconnecting';

interface UseWebSocketOptions {
  roomId: string;
  token: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  autoConnect?: boolean;
}

export function useWebSocket({
  roomId,
  token,
  onMessage,
  onStatusChange,
  autoConnect = true
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocketService | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectInfo, setReconnectInfo] = useState<{
    attempt: number;
    maxAttempts: number;
  } | null>(null);

  const handleStatusChange = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const connect = useCallback(() => {
    if (!token || !roomId || !process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL) {
      return;
    }

    // Limpiar conexión anterior
    if (wsRef.current) {
      wsRef.current.removeAllListeners();
      wsRef.current.disconnect();
    }

    const ws = new WebSocketService({
      url: process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL,
      roomId,
      token,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5
    });

    // Configurar listeners
    ws.on('statusChange', handleStatusChange);
    
    ws.on('authenticated', () => {
      setIsReconnecting(false);
      setReconnectInfo(null);
      toast.success('Conectado al chat');
    });

    ws.on('message', (data: WebSocketMessage) => {
      onMessage?.(data);
    });

    ws.on('system', (data: WebSocketMessage) => {
      onMessage?.(data);
    });

    ws.on('error', ({ type, data }) => {
      if (type === 'message' && data?.type === 'error') {
        toast.error('Error del servidor', { description: data.content });
      } else if (type === 'connection') {
        toast.error('Error de conexión');
      }
    });

    ws.on('reconnecting', ({ attempt, maxAttempts }) => {
      setIsReconnecting(true);
      setReconnectInfo({ attempt, maxAttempts });
      toast.info(`Reconectando... (intento ${attempt}/${maxAttempts})`);
    });

    ws.on('close', ({ code, reason }) => {
      if (code !== 1000) { // 1000 es cierre normal
        toast.warning('Conexión cerrada', { description: reason });
      }
    });

    wsRef.current = ws;
    ws.connect();
  }, [token, roomId, handleStatusChange, onMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.removeAllListeners();
      wsRef.current.disconnect();
      wsRef.current = null;
      setStatus('disconnected');
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!wsRef.current) {
      toast.error('No hay conexión activa');
      return false;
    }

    if (status !== 'connected') {
      toast.error('Esperando conexión...');
      return false;
    }

    try {
      wsRef.current.sendMessage(message);
      return true;
    } catch (error) {
        console.log('Error al enviar mensaje:', error);
      toast.error('Error al enviar mensaje');
      return false;
    }
  }, [status]);

  // Auto-conectar cuando tengamos token
  useEffect(() => {
    if (autoConnect && token && roomId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, roomId, autoConnect, connect, disconnect]); // Removemos connect y disconnect de las dependencias

  return {
    status,
    isReconnecting,
    reconnectInfo,
    connect,
    disconnect,
    sendMessage,
    isConnected: status === 'connected'
  };
}