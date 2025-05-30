import { useEffect, useState, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { getCacheService } from '@/services/chat/cache-service';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  userName: string | null;
}

interface CachedToken {
  token: string;
  expiry: number;
  userId: string;
  userName: string;
}

export function useAuth() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isLoading: true,
    error: null,
    userId: null,
    userName: null
  });

  const cacheService = getCacheService();

  const getCacheKey = useCallback((userId: string) => {
    return `auth:token:${userId}`;
  }, []);

  const fetchToken = useCallback(async () => {
    if (!session?.user?.id) {
      return null;
    }

    const cacheKey = getCacheKey(session.user.id);

    try {
      // Intentar obtener del caché primero
      const cached = await cacheService.get<CachedToken>(cacheKey);
      
      if (cached && cached.expiry > Date.now()) {
        setAuthState({
          token: cached.token,
          isLoading: false,
          error: null,
          userId: cached.userId,
          userName: cached.userName
        });
        return cached.token;
      }

      // Si no hay caché válido, obtener nuevo token
      const response = await fetch('/api/auth/token');
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || `Error ${response.status}`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error('No se recibió token');
      }

      // Decodificar el token para obtener la expiración
      const tokenParts = data.token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Usar la expiración del token o 5 minutos por defecto
      const expiryTime = payload.exp ? payload.exp * 1000 : Date.now() + 5 * 60 * 1000;
      
      // Guardar en caché con un margen de seguridad (30 segundos antes de expirar)
      const cacheData: CachedToken = {
        token: data.token,
        expiry: expiryTime - 30000,
        userId: session.user.id,
        userName: session.user.name || 'Usuario'
      };

      // Calcular TTL para Redis
      const ttlSeconds = Math.floor((cacheData.expiry - Date.now()) / 1000);
      if (ttlSeconds > 0) {
        await cacheService.set(cacheKey, cacheData, ttlSeconds);
      }

      setAuthState({
        token: data.token,
        isLoading: false,
        error: null,
        userId: session.user.id,
        userName: session.user.name || 'Usuario'
      });

      return data.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener token';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error('Error de autenticación', { description: errorMessage });
      return null;
    }
  }, [session, cacheService, getCacheKey]);

  useEffect(() => {
    if (!isSessionLoading && session?.user?.id) {
      fetchToken();
    } else if (!isSessionLoading && !session) {
      setAuthState({
        token: null,
        isLoading: false,
        error: 'No hay sesión activa',
        userId: null,
        userName: null
      });
    }
  }, [session, isSessionLoading, fetchToken]);

  const refreshToken = useCallback(async () => {
    if (session?.user?.id) {
      // Limpiar caché
      const cacheKey = getCacheKey(session.user.id);
      await cacheService.delete(cacheKey);
    }
    return fetchToken();
  }, [session, fetchToken, cacheService, getCacheKey]);

  const clearAuthCache = useCallback(async () => {
    if (session?.user?.id) {
      const cacheKey = getCacheKey(session.user.id);
      await cacheService.delete(cacheKey);
    }
  }, [session, cacheService, getCacheKey]);

  return {
    ...authState,
    session,
    isAuthenticated: !!session?.user && !!authState.token,
    refreshToken,
    clearAuthCache
  };
}