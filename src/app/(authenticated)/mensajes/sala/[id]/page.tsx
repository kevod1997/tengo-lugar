'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Header from '@/components/header/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquareDashed, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Asegúrate que estas variables de entorno estén disponibles en el cliente (prefijo NEXT_PUBLIC_)
const NEXT_PUBLIC_CHAT_WEBSOCKET_URL = process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL;
const NEXT_PUBLIC_CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL;

interface ChatMessage {
  id?: string;
  content: string;
  type: 'system' | 'message' | 'error';
  user_id?: string;
  user_name?: string;
  isSender: boolean;
  timestamp: string;
}

export default function ChatRoomPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams();
  const roomId = params.id as string;
  const tripId = searchParamsHook.get('tripId');

  const { data: session, isPending: isSessionLoading, error: sessionError } = authClient.useSession();
  const [jwtForChat, setJwtForChat] = useState<string | null>(null);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [status, setStatus] = useState('Desconectado');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false); // Nueva flag para controlar carga única
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoizar scrollToBottom para evitar recreaciones innecesarias
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Separar el efecto de scroll con su propia dependencia
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((
    content: string,
    type: ChatMessage['type'],
    isSender: boolean,
    userId?: string,
    userName?: string,
    messageId?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => {
      if (messageId && prev.some(msg => msg.id === messageId)) {
        return prev;
      }
      return [...prev, { id: messageId, content, type, user_id: userId, user_name: userName, isSender, timestamp }];
    });
  }, []);

  useEffect(() => {
    const fetchBetterAuthToken = async () => {
      if (session?.user?.id && !jwtForChat && !isFetchingToken) {
        setIsFetchingToken(true);
        setTokenError(null);
        try {
          const response = await fetch('/api/auth/token');
          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              setJwtForChat(data.token);
            } else {
              setTokenError('No se recibió token de autenticación.');
              toast.error('No se pudo obtener el token (respuesta vacía).');
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: "Error desconocido al obtener token." }));
            setTokenError(errorData?.error || `Error del servidor: ${response.status}`);
            toast.error(`Fallo al obtener token: ${errorData?.error || response.statusText}`);
          }
        } catch (error) {
          setTokenError('Error de red al obtener token.');
          toast.error('Error crítico al contactar el servidor de autenticación.');
          console.error("Error fetching better-auth JWT:", error);
        } finally {
          setIsFetchingToken(false);
        }
      }
    };

    if (!isSessionLoading && session && !jwtForChat) {
      fetchBetterAuthToken();
    } else if (!isSessionLoading && (sessionError || !session)) {
      const errorMsg = sessionError?.message || 'Debes iniciar sesión para usar el chat.';
      addMessage(errorMsg, 'error', false);
      setTokenError(errorMsg);
    }
  }, [session, isSessionLoading, jwtForChat, addMessage, isFetchingToken, sessionError]);

  // Separar la carga del historial en su propio efecto con control de carga única
  useEffect(() => {
    const fetchHistory = async () => {
      if (!jwtForChat || !roomId || !NEXT_PUBLIC_CHAT_API_URL || historyLoaded || isLoadingHistory) {
        return;
      }

      setIsLoadingHistory(true);
      try {
        const response = await fetch(`${NEXT_PUBLIC_CHAT_API_URL}/chat/${roomId}/messages?limit=50`, {
          headers: { 'Authorization': `Bearer ${jwtForChat}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            const historyMessages: ChatMessage[] = data.messages.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              type: msg.user_id === 'system' ? 'system' : 'message',
              user_id: msg.user_id,
              user_name: msg.user_name,
              isSender: msg.user_id === session?.user?.id,
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newUniqueHistory = historyMessages.filter(hm => !existingIds.has(hm.id));
              return [...newUniqueHistory, ...prev.filter(pm => !historyMessages.find(hm => hm.id === pm.id))];
            });

            setHistoryLoaded(true); // Marcar como cargado
          }
        } else {
          toast.error("Error al cargar historial de mensajes.");
          console.error("Error fetching history, status:", response.status);
        }
      } catch (error) {
        console.error("Excepción al cargar historial:", error);
        toast.error("Excepción al cargar historial.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (jwtForChat && session?.user?.id && !historyLoaded) {
      fetchHistory();
    }
  }, [jwtForChat, roomId, session?.user?.id, historyLoaded, isLoadingHistory]);

  // Memoizar connectWebSocket y remover dependencias externas innecesarias
  const connectWebSocket = useCallback(() => {
    if (!jwtForChat || !roomId || !NEXT_PUBLIC_CHAT_WEBSOCKET_URL) return;
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = `${NEXT_PUBLIC_CHAT_WEBSOCKET_URL}/ws/${roomId}`;
    addMessage(`Intentando conectar a: ${wsUrl}`, 'system', false);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setStatus('Conectando...');

    socket.onopen = () => {
      socket.send(JSON.stringify({ token: jwtForChat }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const isSender = data.user_id === session?.user?.id;

        if (data.type === 'authenticated' || (data.type === 'system' && data.content?.toLowerCase().includes('bienvenido'))) {
          setStatus('Conectado');
          addMessage(data.content || 'Conectado y autenticado.', 'system', false, data.user_id, data.user_name, data.id_mensaje);
        } else if (data.type === 'system' || data.type === 'error') {
          addMessage(data.content, data.type, false, data.user_id, data.user_name, data.id_mensaje);
          if (data.type === 'error' && data.content?.toLowerCase().includes('autenticación requerida')) {
            setStatus('Error de Autenticación');
          }
        } else if (data.type === 'message') {
          if (!session?.user?.id) {
            console.warn("Sesión de usuario no disponible al recibir mensaje, 'isSender' podría ser incorrecto.");
          }
          addMessage(data.content, 'message', isSender, data.user_id, data.user_name, data.id_mensaje);
        } else {
          addMessage(data.content || JSON.stringify(data), 'system', false, data.user_id, data.user_name, data.id_mensaje);
        }
      } catch (e) {
        addMessage('Error interpretando mensaje del servidor.', 'error', false);
        console.error("WebSocket onmessage error:", e, "Data:", event.data);
      }
    };

    socket.onclose = (event) => {
      setStatus('Desconectado');
      let reason = event.reason || 'Desconexión inesperada.';
      if (event.code === 1000) reason = 'Desconexión normal.';
      else if (event.code === 1008) reason = 'Política violada (ej. autenticación fallida).';
      addMessage(`Conexión cerrada: ${reason} (código ${event.code})`, 'system', false);
    };

    socket.onerror = (ev) => {
      setStatus('Error de Conexión');
      addMessage(`Error de WebSocket. Revisa la conexión.`, 'error', false);
      console.error("WebSocket onerror event:", ev);
    };
  }, [jwtForChat, roomId, session?.user?.id, addMessage]); // Removida NEXT_PUBLIC_CHAT_WEBSOCKET_URL

  useEffect(() => {
    if (jwtForChat && roomId) {
      connectWebSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close(1000, "Componente desmontado");
        socketRef.current = null;
      }
    };
  }, [jwtForChat, roomId, connectWebSocket]);

  const sendMessage = () => {
    if (message.trim() && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: message.trim() }));
      setMessage('');
    } else if (status !== 'Conectado') {
      toast.info("No estás conectado al chat para enviar mensajes.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // UI de Carga y Estados de Error
  if (isSessionLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Cargando sesión...</p></div>;
  }

  if (!session?.user && !isSessionLoading) {
    return (
      <>
        {/* <div className="container mx-auto py-6 px-4"> */}
        <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mensajes', href: '/mensajes' }]} />
        <div className="page-content">
          <div className="mt-6 text-center p-4 border border-red-300 bg-red-50 rounded-md">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-2 text-xl font-semibold text-red-700">Acceso Denegado</h2>
            <p className="mt-1 text-red-600">Debes iniciar sesión para acceder a esta página.</p>
          </div>
        </div>
      </>
    );
  }

  if (isFetchingToken && !jwtForChat) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Autenticando para el chat...</p>
      </div>
    );
  }

  if (tokenError && !jwtForChat) {
    return (
      <>
        {/* <div className="container mx-auto py-6 px-4"> */}
        <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mensajes', href: '/mensajes' }]} />
        <div className="page-content">
          <div className="mt-6 text-center p-4 border border-red-300 bg-red-50 rounded-md">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-2 text-xl font-semibold text-red-700">Error de Autenticación</h2>
            <p className="mt-1 text-red-600">No se pudo obtener un token válido para el chat: {tokenError}</p>
          </div>
        </div>
      </>
    )
  }

  if (!roomId) {
    return (
      <>
        {/* <div className="container mx-auto py-6 px-4"> */}
        <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mensajes', href: '/mensajes' }]} />
        <div className="page-content">
          <div className="mt-6 text-center p-4 border border-orange-300 bg-orange-50 rounded-md">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-400" />
            <h2 className="mt-2 text-xl font-semibold text-orange-700">Sala no Especificada</h2>
            <p className="mt-1 text-orange-600">No se ha proporcionado un ID de sala para el chat.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mensajes', href: '/mensajes' },
          { label: `Chat ${tripId ? `(Viaje ${tripId.substring(0, 8)}...)` : ''}` },
        ]}
      />
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto p-4 border rounded-lg shadow-lg bg-card">
        <div className="mb-2">
          <span className={`text-sm font-semibold ${status === 'Conectado' ? 'text-green-600' :
            status === 'Conectando...' ? 'text-yellow-600' :
              (status === 'Desconectado' || status === 'Error de Conexión' || status === 'Error de Autenticación') ? 'text-red-600' : 'text-gray-500'
            }`}>
            Estado: {status}
          </span>
        </div>

        <ScrollArea className="flex-grow h-0 mb-4 p-3 border rounded-md bg-muted/30">
          {(isLoadingHistory && messages.length === 0) && (
            <div className="text-center text-muted-foreground py-4">Cargando historial de mensajes...</div>
          )}
          {(!isLoadingHistory && messages.length === 0 && historyLoaded) && (
            <div className="text-center text-muted-foreground py-4 flex flex-col items-center">
              <MessageSquareDashed className="w-12 h-12 mb-2 text-gray-400" />
              Aún no hay mensajes en esta sala. ¡Sé el primero en escribir!
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={msg.id || `msg-${index}`}
              className={`mb-2 flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-2 rounded-lg shadow-sm ${msg.type === 'system' ? 'bg-slate-200 text-slate-700 text-xs mx-auto text-center' :
                msg.type === 'error' ? 'bg-red-100 text-red-700 text-xs mx-auto text-center' :
                  msg.isSender ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                {msg.type === 'message' && !msg.isSender && msg.user_name && (
                  <p className="text-xs font-semibold mb-0.5">{msg.user_name}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.type === 'message' && (
                  <p className={`text-xs mt-1 ${msg.isSender ? 'text-right' : 'text-left'} opacity-70`}>
                    {msg.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            type="text"
            className="flex-grow"
            placeholder={status === 'Conectado' ? "Escribe tu mensaje..." : (status === 'Conectando...' || isFetchingToken ? "Conectando..." : "Desconectado")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={status !== 'Conectado' || !jwtForChat}
          />
          <Button
            onClick={sendMessage}
            disabled={status !== 'Conectado' || !message.trim() || !jwtForChat}
            aria-label="Enviar mensaje"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}