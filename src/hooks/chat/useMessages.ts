import { ChatService } from '@/services/chat/chat-service';
import { OfflineMessagesService, PendingMessage } from '@/services/chat/offline-messages-service';
import { WebSocketMessage } from '@/services/chat/websocket-service';
import { ChatMessage } from '@/types/chat-types';
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseMessagesOptions {
    roomId: string;
    token: string | null;
    userId: string | null;
    initialMessages?: ChatMessage[];
    onMessageSent?: (tempId: string, success: boolean) => void;
}

export function useMessages({
    roomId,
    token,
    userId,
    initialMessages = [],
    onMessageSent
}: UseMessagesOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);

    const chatServiceRef = useRef<ChatService | null>(null);
    const offlineServiceRef = useRef<OfflineMessagesService | null>(null);
    const loadedMessagesRef = useRef(new Set<string>());

    // Inicializar servicios
    useEffect(() => {
        if (token && process.env.NEXT_PUBLIC_CHAT_API_URL) {
            chatServiceRef.current = new ChatService(
                process.env.NEXT_PUBLIC_CHAT_API_URL,
                token
            );
        }
        offlineServiceRef.current = new OfflineMessagesService();
    }, [token]);

    // Cargar mensajes pendientes al iniciar
    useEffect(() => {
        const loadPendingMessages = async () => {
            if (!userId || !offlineServiceRef.current) return;

            const pending = await offlineServiceRef.current.getPendingMessages(userId, roomId);
            setPendingMessages(pending);

            // Agregar mensajes pendientes a la lista directamente al estado
            if (pending.length > 0) {
                const timestamp = new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const pendingMessagesFormatted: ChatMessage[] = pending.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    type: 'message' as const,
                    user_id: userId,
                    user_name: 'Tú',
                    isSender: true,
                    timestamp,
                    rawTimestamp: msg.timestamp,
                    isLocal: true,
                    isPending: true
                }));

                setMessages(prev => [...prev, ...pendingMessagesFormatted]);
            }
        };

        loadPendingMessages();
    }, [userId, roomId]);

    // Cargar historial inicial
    const loadHistory = useCallback(async (beforeId?: string) => {
        if (!chatServiceRef.current || isLoadingHistory || !hasMoreHistory) {
            return;
        }

        setIsLoadingHistory(true);
        try {
            const response = await chatServiceRef.current.fetchHistory(roomId, 50, beforeId);

            if (response.messages.length === 0) {
                setHasMoreHistory(false);
                return;
            }

            // Convertir mensajes del servidor al formato local
            const historyMessages: ChatMessage[] = response.messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                type: msg.user_id === 'system' ? 'system' : 'message',
                user_id: msg.user_id,
                user_name: msg.user_name,
                isSender: msg.user_id === userId,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                rawTimestamp: msg.timestamp
            }));

            setMessages(prev => {
                // Filtrar duplicados usando Set
                const newMessages = historyMessages.filter(msg => {
                    if (msg.id && !loadedMessagesRef.current.has(msg.id)) {
                        loadedMessagesRef.current.add(msg.id);
                        return true;
                    }
                    return false;
                });

                // Si estamos cargando mensajes más antiguos, agregarlos al principio
                if (beforeId) {
                    return [...newMessages, ...prev];
                }

                // Si es carga inicial, reemplazar
                return newMessages;
            });

            // Si recibimos menos de 50 mensajes, no hay más historial
            if (response.messages.length < 50) {
                setHasMoreHistory(false);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error('Error al cargar el historial');
        } finally {
            setIsLoadingHistory(false);
        }
    }, [roomId, userId, isLoadingHistory, hasMoreHistory]);

    // Agregar nuevo mensaje desde WebSocket
    const addMessage = useCallback((wsMessage: WebSocketMessage) => {
        const timestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const newMessage: ChatMessage = {
            id: wsMessage.id,
            content: wsMessage.content,
            type: wsMessage.type as ChatMessage['type'],
            user_id: wsMessage.user_id,
            user_name: wsMessage.user_name,
            isSender: wsMessage.user_id === userId,
            timestamp,
            rawTimestamp: new Date().toISOString()
        };

        setMessages(prev => {
            // Evitar duplicados si el mensaje ya tiene ID
            if (newMessage.id && loadedMessagesRef.current.has(newMessage.id)) {
                return prev;
            }

            if (newMessage.id) {
                loadedMessagesRef.current.add(newMessage.id);
            }

            return [...prev, newMessage];
        });
    }, [userId]);

    // Agregar mensaje local (antes de enviarlo)
    const addLocalMessage = useCallback((content: string, customId?: string): string => {
        const tempId = customId || `temp-${Date.now()}`;
        const timestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const localMessage: ChatMessage = {
            id: tempId,
            content,
            type: 'message',
            user_id: userId || '',
            user_name: 'Tú',
            isSender: true,
            timestamp,
            rawTimestamp: new Date().toISOString(),
            isLocal: true,
            isPending: true
        };

        setMessages(prev => [...prev, localMessage]);
        return tempId;
    }, [userId]);

    // Guardar mensaje como pendiente
    const savePendingMessage = useCallback(async (tempId: string, content: string) => {
        if (!userId || !offlineServiceRef.current) return;

        const pendingMessage: PendingMessage = {
            id: tempId,
            roomId,
            content,
            userId,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        await offlineServiceRef.current.savePendingMessage(userId, roomId, pendingMessage);
        setPendingMessages(prev => [...prev, pendingMessage]);
    }, [userId, roomId]);

    // Actualizar mensaje local cuando se confirme del servidor
    const updateLocalMessage = useCallback(async (tempId: string, serverMessage: WebSocketMessage) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === tempId
                    ? { ...msg, id: serverMessage.id, isLocal: false, isPending: false }
                    : msg
            )
        );

        if (serverMessage.id) {
            loadedMessagesRef.current.add(serverMessage.id);
        }

        // Eliminar de mensajes pendientes
        if (userId && offlineServiceRef.current) {
            await offlineServiceRef.current.removePendingMessage(userId, roomId, tempId);
            setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
        }

        onMessageSent?.(tempId, true);
    }, [userId, roomId, onMessageSent]);

    // Eliminar mensaje local (en caso de error)
    const removeLocalMessage = useCallback(async (tempId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));

        // Eliminar de mensajes pendientes
        if (userId && offlineServiceRef.current) {
            await offlineServiceRef.current.removePendingMessage(userId, roomId, tempId);
            setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
        }

        onMessageSent?.(tempId, false);
    }, [userId, roomId, onMessageSent]);

    // Reintentar enviar mensajes pendientes
    const retryPendingMessages = useCallback(async (sendFunction: (content: string) => boolean) => {
        for (const pendingMsg of pendingMessages) {
            const success = sendFunction(pendingMsg.content);
            if (success) {
                // El mensaje se enviará y se actualizará cuando llegue la confirmación del servidor
                toast.success('Mensaje pendiente enviado');
            }
        }
    }, [pendingMessages]);

    // Limpiar mensajes al cambiar de sala
    useEffect(() => {
        // Capturar la referencia actual
        const loadedMessages = loadedMessagesRef.current;

        return () => {
            loadedMessages.clear();
        };
    }, [roomId]);

    return {
        messages,
        isLoadingHistory,
        hasMoreHistory,
        pendingMessages,
        loadHistory,
        addMessage,
        addLocalMessage,
        savePendingMessage,
        updateLocalMessage,
        removeLocalMessage,
        retryPendingMessages
    };
}