'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MessageInputProps {
  onSendMessage: (message: string) => boolean;
  isConnected: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  onSendMessage, 
  isConnected, 
  disabled = false,
  placeholder = "Escribe tu mensaje..."
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      toast.error('No puedes enviar un mensaje vacío');
      return;
    }

    if (!isConnected) {
      toast.error('No estás conectado al chat');
      return;
    }

    setIsSending(true);
    const success = onSendMessage(trimmedMessage);
    
    if (success) {
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    
    setIsSending(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const isDisabled = disabled || !isConnected || isSending;

  return (
    <div className="flex gap-2 p-4 border-t bg-background">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyPress}
        placeholder={isConnected ? placeholder : 'Conectando...'}
        disabled={isDisabled}
        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={isDisabled || !message.trim()}
        size="icon"
        className="self-end"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}