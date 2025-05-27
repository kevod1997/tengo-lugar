// src/actions/chat/get-active-user-chats.ts
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserTrips } from '@/actions/trip/get-user-trips';

const CHAT_API_URL = process.env.CHAT_API_URL; // URL de tu API de FastAPI
const NEXT_PUBLIC_CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://localhost:3000';

interface ChatInfo {
  tripId: string;
  tripName: string;
  roomId?: string;
  status: 'active' | 'not_created' | 'error' | 'no_access';
  createdAt?: string;
}

async function getJwtForServerAction(): Promise<string | null> {
  // Para que una Server Action obtenga el JWT que better-auth genera,
  // la forma más canónica es llamar al endpoint /api/auth/token
  // que better-auth expone. Esto requiere pasar las cookies de la sesión actual.
  const cookieHeader = (await headers()).get('cookie');
  if (!cookieHeader) {
    console.error('getActiveUserChats: No cookie header, no se puede obtener JWT.');
    return null;
  }

  try {
    const tokenResponse = await fetch(new URL('/api/auth/token', NEXT_PUBLIC_CLIENT_URL).toString(), {
      headers: {
        'Cookie': cookieHeader,
      },
    });

    if (!tokenResponse.ok) {
      console.error(
        `getActiveUserChats: Error al obtener JWT de /api/auth/token: ${tokenResponse.status} ${await tokenResponse.text()}`
      );
      return null;
    }
    const tokenData = await tokenResponse.json();
    return tokenData.token;
  } catch (error) {
    console.error('getActiveUserChats: Excepción al obtener JWT:', error);
    return null;
  }
}

export async function getActiveUserChats(): Promise<ChatInfo[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    // console.log('getActiveUserChats: No hay sesión de usuario.');
    return [];
  }

  if (!CHAT_API_URL) {
    console.error('getActiveUserChats: CHAT_API_URL no está configurado.');
    return [];
  }

  const jwtToken = await getJwtForServerAction();
  if (!jwtToken) {
    console.error('getActiveUserChats: No se pudo obtener el JWT para las llamadas a la API de chat.');
    // Puedes decidir devolver un array vacío o con errores.
    // Devolver vacío es más simple si la UI maneja "no hay chats".
    return [];
  }

  const userTripsData = await getUserTrips();
  const chats: ChatInfo[] = [];

  const allUserTripsForChat = [
    ...(userTripsData.activeDriverTrips?.map(trip => ({ ...trip })) || []),
    ...(userTripsData.activePassengerTrips?.map(trip => ({ ...trip })) || []),
  ];
  console.log(allUserTripsForChat)

  for (const tripInfo of allUserTripsForChat) {
    try {
      const response = await fetch(`${CHAT_API_URL}/trip/${tripInfo.id}/chat`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }, // Usa el JWT de better-auth
      });

      const tripName = `Viaje a ${tripInfo.destinationCity || 'destino desconocido'}`;

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `getActiveUserChats: API de chat respondió con error para viaje ${tripInfo.id} (${response.status}): ${errorText}`
        );
        chats.push({
          tripId: tripInfo.id,
          tripName,
          status: response.status === 403 ? 'no_access' : 'error',
        });
        continue;
      }

      const data = await response.json();
      chats.push({
        tripId: tripInfo.id,
        tripName,
        roomId: data.room_id,
        status: data.status, // 'active' o 'not_created'
        createdAt: data.created_at,
      });
    } catch (error) {
      console.error(`getActiveUserChats: Excepción al contactar API de chat para viaje ${tripInfo.id}:`, error);
      chats.push({
        tripId: tripInfo.id,
        tripName: `Viaje a ${tripInfo.destinationCity || 'desconocido'}`,
        status: 'error',
      });
    }
  }
  return chats;
}