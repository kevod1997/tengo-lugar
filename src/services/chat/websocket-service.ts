import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: 'system' | 'message' | 'error' | 'authenticated';
  content: string;
  user_id?: string;
  user_name?: string;
  id?: string;
  timestamp?: string;
}

export interface WebSocketConfig {
  url: string;
  roomId: string;
  token: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionalClose = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${this.config.url}/ws/${this.config.roomId}`;
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      this.emit('error', { type: 'connection', error });
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.emit('statusChange', 'connecting');
      // Enviar token de autenticación
      this.send({ token: this.config.token });
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        
        // Manejar diferentes tipos de mensajes
        switch (data.type) {
          case 'authenticated':
            this.emit('statusChange', 'connected');
            this.emit('authenticated', data);
            break;
          case 'error':
            this.emit('error', { type: 'message', data });
            if (data.content?.toLowerCase().includes('autenticación')) {
              this.emit('statusChange', 'authError');
            }
            break;
          case 'system':
            this.emit('system', data);
            break;
          case 'message':
            this.emit('message', data);
            break;
          default:
            this.emit('unknown', data);
        }
      } catch (error) {
        this.emit('error', { type: 'parse', error });
      }
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      this.emit('statusChange', 'disconnected');
      this.emit('close', { code: event.code, reason: event.reason });

      // Intentar reconectar si no fue un cierre intencional
      if (!this.isIntentionalClose && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.emit('statusChange', 'error');
      this.emit('error', { type: 'websocket' });
    };
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping cada 30 segundos
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1);
    
    this.emit('reconnecting', { 
      attempt: this.reconnectAttempts, 
      maxAttempts: this.config.maxReconnectAttempts,
      delay 
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.emit('error', { type: 'send', error: 'WebSocket not connected' });
    }
  }

  sendMessage(message: string): void {
    this.send({ message });
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}