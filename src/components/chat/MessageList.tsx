'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareDashed, Loader2, AlertCircle } from 'lucide-react';
import { ChatMessage } from '@/types/chat-types';
import { Button } from '@/components/ui/button';

interface MessageListProps {
  messages: ChatMessage[];
  isLoadingHistory: boolean;
  hasMoreHistory: boolean;
  onLoadMore?: () => void;
  onRetryMessage?: (messageId: string) => void;
}

export function MessageList({ 
  messages, 
  isLoadingHistory, 
  hasMoreHistory,
  onLoadMore,
  onRetryMessage 
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);
  const isLoadingMoreRef = useRef(false);

  // Auto-scroll solo cuando se agregan mensajes nuevos al final
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && !isLoadingMoreRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastMessageCountRef.current = messages.length;
    isLoadingMoreRef.current = false;
  }, [messages]);

  // Manejar scroll infinito para cargar más mensajes
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    // Si estamos cerca del top (100px), cargar más mensajes
    if (target.scrollTop < 100 && hasMoreHistory && !isLoadingHistory && onLoadMore) {
      isLoadingMoreRef.current = true;
      const previousHeight = target.scrollHeight;
      
      onLoadMore();
      
      // Mantener la posición de scroll después de cargar mensajes
      requestAnimationFrame(() => {
        const newHeight = target.scrollHeight;
        target.scrollTop = newHeight - previousHeight;
      });
    }
  }, [hasMoreHistory, isLoadingHistory, onLoadMore]);

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isSystem = msg.type === 'system';
    const isError = msg.type === 'error';
    const showRetry = msg.isPending && msg.isLocal;

    return (
      <div
        key={msg.id || `msg-${index}`}
        className={`mb-3 flex ${msg.isSender ? 'justify-end' : 'justify-start'} ${
          isSystem || isError ? 'justify-center' : ''
        }`}
      >
        <div
          className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm relative ${
            isSystem ? 'bg-slate-100 text-slate-600 text-xs' :
            isError ? 'bg-red-50 text-red-700 text-xs border border-red-200' :
            msg.isSender ? 'bg-primary text-primary-foreground' : 
            'bg-secondary text-secondary-foreground'
          } ${msg.isPending ? 'opacity-70' : ''}`}
        >
          {/* Nombre del usuario (solo para mensajes recibidos) */}
          {!isSystem && !isError && !msg.isSender && msg.user_name && (
            <p className="text-xs font-semibold mb-1 opacity-80">
              {msg.user_name}
            </p>
          )}
          
          {/* Contenido del mensaje */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {msg.content}
          </p>
          
          {/* Timestamp y estado */}
          {!isSystem && !isError && (
            <div className={`text-xs mt-1 ${msg.isSender ? 'text-right' : 'text-left'} opacity-60`}>
              {msg.timestamp}
              {msg.isPending && (
                <span className="ml-2 italic">• Enviando...</span>
              )}
            </div>
          )}
          
          {/* Botón de reintentar */}
          {showRetry && onRetryMessage && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute -bottom-8 right-0 text-xs"
              onClick={() => onRetryMessage(msg.id!)}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="flex-grow h-0 px-4 pb-2"
      onScroll={handleScroll}
    >
      {/* Botón para cargar más mensajes */}
      {hasMoreHistory && (
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingHistory}
          >
            {isLoadingHistory ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar mensajes anteriores'
            )}
          </Button>
        </div>
      )}

      {/* Indicador de carga inicial */}
      {isLoadingHistory && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full py-8">
          <Loader2 className="h-8 w-8 mb-3 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando historial...</p>
        </div>
      )}

      {/* Estado vacío */}
      {!isLoadingHistory && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full py-8">
          <MessageSquareDashed className="h-12 w-12 mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aún no hay mensajes en esta sala.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ¡Sé el primero en escribir!
          </p>
        </div>
      )}

      {/* Lista de mensajes */}
      <div className="space-y-1">
        {messages.map((msg, index) => renderMessage(msg, index))}
      </div>
      
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
}