// // src/app/mensajes/room/[id]/page.tsx
// 'use client';
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useParams, useSearchParams } from 'next/navigation';
// import { authClient } from '@/lib/auth-client';
// import Header from '@/components/header/header';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Send, MessageSquareDashed, AlertCircle } from 'lucide-react'; // AlertCircle para errores
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { toast } from 'sonner';

// // Asegúrate que estas variables de entorno estén disponibles en el cliente (prefijo NEXT_PUBLIC_)
// const NEXT_PUBLIC_CHAT_WEBSOCKET_URL = process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL;
// const NEXT_PUBLIC_CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL; // Para historial

// interface ChatMessage {
//   id?: string;
//   content: string;
//   type: 'system' | 'message' | 'error';
//   user_id?: string;
//   user_name?: string;
//   isSender: boolean;
//   timestamp: string;
// }

// export default function ChatRoomPage() {
//   const params = useParams();
//   const searchParamsHook = useSearchParams();
//   const roomId = params.id as string;
//   const tripId = searchParamsHook.get('tripId'); // Para breadcrumbs

//   const { data: session, isPending: isSessionLoading, error: sessionError } = authClient.useSession();
//   const [jwtForChat, setJwtForChat] = useState<string | null>(null);
//   const [isFetchingToken, setIsFetchingToken] = useState(false);
//   const [tokenError, setTokenError] = useState<string | null>(null);

//   const [status, setStatus] = useState('Desconectado');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [isLoadingHistory, setIsLoadingHistory] = useState(false);
//   const socketRef = useRef<WebSocket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, []);

//   useEffect(scrollToBottom, [messages]);

//   const addMessage = useCallback((
//     content: string,
//     type: ChatMessage['type'],
//     isSender: boolean,
//     userId?: string,
//     userName?: string,
//     messageId?: string // El ID del mensaje de la DB, si existe
//   ) => {
//     const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     setMessages(prev => {
//       if (messageId && prev.some(msg => msg.id === messageId)) {
//         return prev; // Evitar duplicados, especialmente del historial
//       }
//       // Para mensajes nuevos, no tendrán messageId hasta que lleguen del WebSocket (si el backend lo asigna y devuelve)
//       // O si el mensaje es local antes del eco, no tendrá ID de la DB.
//       return [...prev, { id: messageId, content, type, user_id: userId, user_name: userName, isSender, timestamp }];
//     });
//   }, []);

//   useEffect(() => {
//     const fetchBetterAuthToken = async () => {
//       if (session?.user?.id && !jwtForChat && !isFetchingToken) {
//         setIsFetchingToken(true);
//         setTokenError(null);
//         try {
//           const response = await fetch('/api/auth/token'); // Endpoint de better-auth
//           if (response.ok) {
//             const data = await response.json();
//             if (data.token) {
//               setJwtForChat(data.token);
//             } else {
//               setTokenError('No se recibió token de autenticación.');
//               toast.error('No se pudo obtener el token (respuesta vacía).');
//             }
//           } else {
//             const errorData = await response.json().catch(() => ({ error: "Error desconocido al obtener token."}));
//             setTokenError(errorData?.error || `Error del servidor: ${response.status}`);
//             toast.error(`Fallo al obtener token: ${errorData?.error || response.statusText}`);
//           }
//         } catch (error) {
//           setTokenError('Error de red al obtener token.');
//           toast.error('Error crítico al contactar el servidor de autenticación.');
//           console.error("Error fetching better-auth JWT:", error);
//         } finally {
//           setIsFetchingToken(false);
//         }
//       }
//     };

//     if (!isSessionLoading && session && !jwtForChat) {
//         fetchBetterAuthToken();
//     } else if (!isSessionLoading && (sessionError || !session)) {
//         const errorMsg = sessionError?.message || 'Debes iniciar sesión para usar el chat.';
//         addMessage(errorMsg, 'error', false);
//         setTokenError(errorMsg); // Para mostrar en UI si es necesario
//     }
//   }, [session, isSessionLoading, jwtForChat, addMessage, isFetchingToken, sessionError]);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       if (!jwtForChat || !roomId || !NEXT_PUBLIC_CHAT_API_URL) return;

//       // Solo cargar historial si no hay mensajes y no se está cargando ya
//       if (messages.length > 0 && !isLoadingHistory) return; 

//       setIsLoadingHistory(true);
//       try {
//         const response = await fetch(`${NEXT_PUBLIC_CHAT_API_URL}/chat/${roomId}/messages?limit=50`, {
//           headers: { 'Authorization': `Bearer ${jwtForChat}` }
//         });
//         if (response.ok) {
//           const data = await response.json();
//           if (data.messages && Array.isArray(data.messages)) {
//             const historyMessages: ChatMessage[] = data.messages.map((msg: any) => ({
//               id: msg.id, // ID del mensaje de la DB
//               content: msg.content,
//               type: msg.user_id === 'system' ? 'system' : 'message',
//               user_id: msg.user_id,
//               user_name: msg.user_name,
//               isSender: msg.user_id === session?.user?.id,
//               timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//             })).sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Asegurar orden cronológico si es necesario

//             // Reemplazar mensajes o añadir al principio inteligentemente
//             setMessages(prev => {
//                 const existingIds = new Set(prev.map(m => m.id));
//                 const newUniqueHistory = historyMessages.filter(hm => !existingIds.has(hm.id));
//                 return [...newUniqueHistory, ...prev.filter(pm => !historyMessages.find(hm => hm.id === pm.id))]; // fusionar sin duplicados
//             });

//           }
//         } else {
//           toast.error("Error al cargar historial de mensajes.");
//           console.error("Error fetching history, status:", response.status);
//         }
//       } catch (error) {
//         console.error("Excepción al cargar historial:", error);
//         toast.error("Excepción al cargar historial.");
//       } finally {
//         setIsLoadingHistory(false);
//       }
//     };

//     if (jwtForChat && session?.user?.id) {
//         fetchHistory();
//     }
//   }, [jwtForChat, roomId, session?.user?.id, NEXT_PUBLIC_CHAT_API_URL]); // `messages.length` removido de las dependencias para permitir recarga o carga inicial


//   const connectWebSocket = useCallback(() => {
//     if (!jwtForChat || !roomId || !NEXT_PUBLIC_CHAT_WEBSOCKET_URL) return;
//     if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
//       return;
//     }

//     const wsUrl = `${NEXT_PUBLIC_CHAT_WEBSOCKET_URL}/ws/${roomId}`;
//     addMessage(`Intentando conectar a: ${wsUrl}`, 'system', false);
//     const socket = new WebSocket(wsUrl);
//     socketRef.current = socket;
//     setStatus('Conectando...');

//     socket.onopen = () => {
//       socket.send(JSON.stringify({ token: jwtForChat }));
//       // No setear 'Conectado' aquí, esperar mensaje del backend
//     };

//     socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data as string);
//         const isSender = data.user_id === session?.user?.id; // Es importante tener session.user.id aquí

//         if (data.type === 'authenticated' || (data.type === 'system' && data.content?.toLowerCase().includes('bienvenido'))) {
//             setStatus('Conectado');
//             addMessage(data.content || 'Conectado y autenticado.', 'system', false, data.user_id, data.user_name, data.id_mensaje);
//         } else if (data.type === 'system' || data.type === 'error') {
//             addMessage(data.content, data.type, false, data.user_id, data.user_name, data.id_mensaje);
//             if(data.type === 'error' && data.content?.toLowerCase().includes('autenticación requerida')) {
//                 setStatus('Error de Autenticación');
//             }
//         } else if (data.type === 'message') {
//             // Asegurarse de que el usuario de sesión esté disponible para la comparación 'isSender'
//             if(!session?.user?.id) {
//                 console.warn("Sesión de usuario no disponible al recibir mensaje, 'isSender' podría ser incorrecto.");
//             }
//             addMessage(data.content, 'message', isSender, data.user_id, data.user_name, data.id_mensaje);
//         } else {
//             addMessage(data.content || JSON.stringify(data), 'system', false, data.user_id, data.user_name, data.id_mensaje);
//         }
//       } catch (e) {
//         addMessage('Error interpretando mensaje del servidor.', 'error', false);
//         console.error("WebSocket onmessage error:", e, "Data:", event.data);
//       }
//     };

//     socket.onclose = (event) => {
//       setStatus('Desconectado');
//       let reason = event.reason || 'Desconexión inesperada.';
//       if (event.code === 1000) reason = 'Desconexión normal.';
//       else if (event.code === 1008) reason = 'Política violada (ej. autenticación fallida).';
//       addMessage(`Conexión cerrada: ${reason} (código ${event.code})`, 'system', false);
//     };
//     socket.onerror = (ev) => {
//       setStatus('Error de Conexión');
//       addMessage(`Error de WebSocket. Revisa la conexión.`, 'error', false);
//       console.error("WebSocket onerror event:", ev);
//     };
//   }, [jwtForChat, roomId, session?.user?.id, addMessage, NEXT_PUBLIC_CHAT_WEBSOCKET_URL]);

//   useEffect(() => {
//     if (jwtForChat && roomId) {
//       connectWebSocket();
//     }
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.onclose = null; 
//         socketRef.current.close(1000, "Componente desmontado");
//         socketRef.current = null;
//       }
//     };
//   }, [jwtForChat, roomId, connectWebSocket]);

//   const sendMessage = () => {
//     if (message.trim() && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//       socketRef.current.send(JSON.stringify({ message: message.trim() }));
//       setMessage('');
//     } else if (status !== 'Conectado'){
//         toast.info("No estás conectado al chat para enviar mensajes.");
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   // UI de Carga y Estados de Error
//   if (isSessionLoading) {
//     return <div className="flex justify-center items-center h-screen"><p>Cargando sesión...</p></div>;
//   }

//   if (!session?.user && !isSessionLoading) { // Si ya terminó de cargar y no hay sesión
//      return (
//       <div className="container mx-auto py-6 px-4">
//         <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mensajes', href: '/mensajes' }]} />
//         <div className="mt-6 text-center p-4 border border-red-300 bg-red-50 rounded-md">
//             <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
//             <h2 className="mt-2 text-xl font-semibold text-red-700">Acceso Denegado</h2>
//             <p className="mt-1 text-red-600">Debes iniciar sesión para acceder a esta página.</p>
//             {/* Podrías añadir un botón de login aquí */}
//         </div>
//       </div>
//      );
//   }

//   if (isFetchingToken && !jwtForChat) { // Cargando token pero aún no lo tenemos
//     return (
//         <div className="flex justify-center items-center h-screen">
//             <p>Autenticando para el chat...</p>
//         </div>
//     );
//   }

//   if (tokenError && !jwtForChat) { // Error al obtener el token y no tenemos uno
//       return (
//            <div className="container mx-auto py-6 px-4">
//             <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mensajes', href: '/mensajes' }]} />
//             <div className="mt-6 text-center p-4 border border-red-300 bg-red-50 rounded-md">
//                 <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
//                 <h2 className="mt-2 text-xl font-semibold text-red-700">Error de Autenticación</h2>
//                 <p className="mt-1 text-red-600">No se pudo obtener un token válido para el chat: {tokenError}</p>
//             </div>
//         </div>
//       )
//   }

//   if (!roomId) {
//     return (
//       <div className="container mx-auto py-6 px-4">
//         <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mensajes', href: '/mensajes' }]} />
//          <div className="mt-6 text-center p-4 border border-orange-300 bg-orange-50 rounded-md">
//             <AlertCircle className="mx-auto h-12 w-12 text-orange-400" />
//             <h2 className="mt-2 text-xl font-semibold text-orange-700">Sala no Especificada</h2>
//             <p className="mt-1 text-orange-600">No se ha proporcionado un ID de sala para el chat.</p>
//         </div>
//       </div>
//     );
//   }
//   // Si llegamos aquí, deberíamos tener session.user y jwtForChat (o estar a punto de tenerlo si la UI no actualizó aún)

//   return (
//     <>
//       <Header
//         breadcrumbs={[
//           { label: 'Inicio', href: '/' },
//           { label: 'Mensajes', href: '/mensajes' },
//           { label: `Chat ${tripId ? `(Viaje ${tripId.substring(0,8)}...)` : ''}` }, 
//         ]}
//       />
//       <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto p-4 border rounded-lg shadow-lg bg-card">
//         <div className="mb-2">
//           <span className={`text-sm font-semibold ${
//             status === 'Conectado' ? 'text-green-600' : 
//             status === 'Conectando...' ? 'text-yellow-600' : 
//             (status === 'Desconectado' || status === 'Error de Conexión' || status === 'Error de Autenticación') ? 'text-red-600' : 'text-gray-500' // Estado por defecto
//           }`}>
//             Estado: {status}
//           </span>
//         </div>

//         <ScrollArea className="flex-grow h-0 mb-4 p-3 border rounded-md bg-muted/30">
//           {(isLoadingHistory && messages.length === 0) && (
//             <div className="text-center text-muted-foreground py-4">Cargando historial de mensajes...</div>
//           )}
//           {(!isLoadingHistory && messages.length === 0) && (
//              <div className="text-center text-muted-foreground py-4 flex flex-col items-center">
//                 <MessageSquareDashed className="w-12 h-12 mb-2 text-gray-400" />
//                 Aún no hay mensajes en esta sala. ¡Sé el primero en escribir!
//             </div>
//           )}
//           {messages.map((msg, index) => (
//             <div
//               key={msg.id || `msg-${index}`} // msg.id viene del historial o del backend si el mensaje lo incluye
//               className={`mb-2 flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}
//             >
//               <div className={`max-w-[70%] p-2 rounded-lg shadow-sm ${
//                   msg.type === 'system' ? 'bg-slate-200 text-slate-700 text-xs mx-auto text-center' :
//                   msg.type === 'error' ? 'bg-red-100 text-red-700 text-xs mx-auto text-center' : // Errores también centrados
//                   msg.isSender ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
//               }`}>
//                 {msg.type === 'message' && !msg.isSender && msg.user_name && (
//                   <p className="text-xs font-semibold mb-0.5">{msg.user_name}</p>
//                 )}
//                 <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
//                 {msg.type === 'message' && ( // Mostrar timestamp solo para mensajes normales
//                     <p className={`text-xs mt-1 ${msg.isSender ? 'text-right' : 'text-left'} opacity-70`}>
//                     {msg.timestamp}
//                     </p>
//                 )}
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </ScrollArea>

//         <div className="flex gap-2">
//           <Input
//             type="text"
//             className="flex-grow"
//             placeholder={status === 'Conectado' ? "Escribe tu mensaje..." : (status === 'Conectando...' || isFetchingToken ? "Conectando..." : "Desconectado")}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             disabled={status !== 'Conectado' || !jwtForChat} // Deshabilitar si no hay token o no está conectado
//           />
//           <Button
//             onClick={sendMessage}
//             disabled={status !== 'Conectado' || !message.trim() || !jwtForChat}
//             aria-label="Enviar mensaje"
//           >
//             <Send className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// }

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import Header from '@/components/header/header';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { ChatRoomInfo, ChatService } from '@/services/chat/chat-service';
import { ChatRoom } from '@/components/chat/ChatRoom';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tripId?: string }>;
}

// Generar metadata dinámica
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Chat - Sala ${id.substring(0, 8)}`,
    description: 'Chat en tiempo real para tu viaje',
  };
}

// Componente de Loading
function ChatRoomSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

// Componente de Error
function ChatRoomError({ message }: { message: string }) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mt-6 text-center p-4 border border-red-300 bg-red-50 rounded-md">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h2 className="mt-2 text-xl font-semibold text-red-700">Error</h2>
        <p className="mt-1 text-red-600">{message}</p>
      </div>
    </div>
  );
}

// Server Component principal
export default async function ChatRoomPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const roomId = resolvedParams.id;
  const tripId = resolvedSearchParams.tripId;

  // Verificar autenticación en el servidor
  const currentHeaders = await headers();
  const session = await auth.api.getSession({
    headers: currentHeaders,
  });

  if (!session) {
    redirect(`/login?redirect_url=/mensajes/room/${roomId}`);
  }

  // Verificar que el room ID existe
  if (!roomId) {
    notFound();
  }

  // Intentar obtener información de la sala y mensajes iniciales
  let chatRoomInfo: ChatRoomInfo | null = null;
  let initialMessages: any[] = [];
  let error: string | null = null;

  try {
    const appUrl = process.env.NEXT_PUBLIC_CLIENT_URL; // Ensure this is your canonical public URL
    if (!appUrl) {
      throw new Error("Application URL (NEXT_PUBLIC_CLIENT_URL) is not configured.");
    }
    const cookieHeaderValue = currentHeaders.get('cookie');

    const fetchHeaders: HeadersInit = {};
    if (cookieHeaderValue) {
      fetchHeaders['Cookie'] = cookieHeaderValue;
    } else {
      console.warn("Server Component: No 'cookie' header found in incoming request. /api/auth/token fetch might fail.");
    }

    console.log(`Server Component: Attempting to fetch ${appUrl}/api/auth/token.`);
    if (cookieHeaderValue) {
      console.log("Server Component: Forwarding cookie header:", cookieHeaderValue.substring(0, 100) + "..."); // Log a snippet for privacy
    }


    // Obtener token para llamadas al servidor
    const tokenResponse = await fetch(`${appUrl}/api/auth/token`, {
      headers: fetchHeaders,
    });

    console.log('Server Component: Token response from /api/auth/token:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok,
      url: tokenResponse.url,
    });

    if (tokenResponse.ok) {
      const { token } = await tokenResponse.json();

      if (token && process.env.NEXT_PUBLIC_CHAT_API_URL) {
        const chatService = new ChatService(process.env.NEXT_PUBLIC_CHAT_API_URL, token);

        // Si tenemos tripId, verificar que la sala existe
        if (tripId) {
          try {
            chatRoomInfo = await chatService.getTripChatRoom(tripId);

            if (chatRoomInfo.status === 'not_created') {
              error = 'La sala de chat no ha sido creada para este viaje.';
            } else if (chatRoomInfo.room_id && chatRoomInfo.room_id !== roomId) {
              // Redirigir al room ID correcto
              redirect(`/mensajes/room/${chatRoomInfo.room_id}?tripId=${tripId}`);
            }
          } catch (e) {
            console.error('Error fetching chat room info:', e);
          }
        }

        // Intentar cargar mensajes iniciales
        if (!error) {
          try {
            const historyResponse = await chatService.fetchHistory(roomId, 50);
            initialMessages = historyResponse.messages;
          } catch (e) {
            console.error('Error fetching initial messages:', e);
            // No es crítico, el cliente puede cargar los mensajes
          }
        }
      }
    }
  } catch (e) {
    console.error('Error in chat room setup:', e);
  }

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Mensajes', href: '/mensajes' },
    {
      label: tripId
        ? `Chat del viaje ${tripId.substring(0, 8)}...`
        : 'Chat'
    },
  ];

  return (
    <>
      <Header breadcrumbs={breadcrumbs} />

      <div className="container mx-auto py-4 px-4">
        {error ? (
          <ChatRoomError message={error} />
        ) : (
          <Suspense fallback={<ChatRoomSkeleton />}>
            <ChatRoom
              roomId={roomId}
              initialMessages={initialMessages}
            />
          </Suspense>
        )}
      </div>
    </>
  );
}