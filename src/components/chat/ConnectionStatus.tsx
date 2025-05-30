'use client';

import React from 'react';
import { AlertCircle, WifiOff, Wifi, Loader2 } from 'lucide-react';
import { ConnectionStatus as Status } from '@/hooks/chat/useWebSockets';

interface ConnectionStatusProps {
  status: Status;
  reconnectInfo?: {
    attempt: number;
    maxAttempts: number;
  } | null;
}

export function ConnectionStatus({ status, reconnectInfo }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: 'Conectado',
          className: 'text-green-600'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Conectando...',
          className: 'text-yellow-600'
        };
      case 'reconnecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: reconnectInfo 
            ? `Reconectando (${reconnectInfo.attempt}/${reconnectInfo.maxAttempts})...`
            : 'Reconectando...',
          className: 'text-orange-600'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Desconectado',
          className: 'text-red-600'
        };
      case 'authError':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Error de autenticación',
          className: 'text-red-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Error de conexión',
          className: 'text-red-600'
        };
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Desconocido',
          className: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${config.className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}