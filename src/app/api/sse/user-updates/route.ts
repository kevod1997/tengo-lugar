import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { redisSubscriber } from '@/lib/redis'; // Nuestro cliente de suscripción
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const channelName = `user-updates:${userId}`;

  const stream = new ReadableStream({
    async start(controller) {
      console.log(`SSE: Client ${userId} attempting to connect to channel ${channelName}`);

      const encoder = new TextEncoder();
      const sendEvent = (eventName: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(`event: ${eventName}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          console.error(`SSE Stream (user ${userId}): Error enqueuing chunk for event ${eventName}`, e);
          // Podríamos intentar cerrar el stream desde aquí si hay error.
        }
      };

      // Función para manejar mensajes de Redis
      const handleRedisMessage = (channel: string, message: string) => {
        if (channel === channelName) {
          try {
            const eventData = JSON.parse(message); // Asumimos que el mensaje de Redis es el objeto evento completo
            // El evento ya debería tener un nombre (ej. 'user_verification_update') y los datos
            // así que necesitamos una estructura para el mensaje de Redis.
            // Ej: { eventName: "user_verification_update", payload: { userId, dataType, ... } }
            if (eventData.eventName && eventData.payload) {
              sendEvent(eventData.eventName, eventData.payload);
              console.log(`SSE: Relayed event '${eventData.eventName}' from Redis to user ${userId}`);
            } else {
              console.warn(`SSE: Received malformed message from Redis for user ${userId}:`, message);
            }
          } catch (error) {
            console.error(`SSE: Error parsing message from Redis for user ${userId}:`, error);
          }
        }
      };

      // Suscribirse al canal de Redis para este usuario
      // ¡ASEGÚRATE QUE redisSubscriber ES UN NUEVO CLIENTE POR REQUEST o que manejas las suscripciones correctamente!
      // Para múltiples requests concurrentes al mismo proceso Node, necesitarás un nuevo cliente Redis
      // para cada suscripción o un pool de clientes, o un cliente que pueda multiplexar suscripciones.
      // Con ioredis, un solo cliente puede suscribirse a múltiples canales.
      // Pero si este endpoint es llamado por muchos usuarios, CADA UNO necesita su propia lógica de suscripción y desuscripción.

      // IMPORTANTE: La instancia de redisSubscriber debe ser la misma durante la vida de esta conexión SSE.
      // Si `redisSubscriber` se crea globalmente (como lo hicimos en lib/redis.ts), está bien.
      // Lo crítico es que el `message` listener se añada y se quite correctamente.
      redisSubscriber.subscribe(channelName, (err, count) => {
        if (err) {
          console.error(`SSE: Failed to subscribe to Redis channel ${channelName} for user ${userId}:`, err);
          controller.error(err); // Cierra el stream con error
          return;
        }
        console.log(`SSE: Subscribed to Redis channel ${channelName} for user ${userId}. Subscriptions: ${count}`);
      });

      redisSubscriber.on('message', handleRedisMessage);

      // Enviar evento de conexión establecida
      sendEvent('connection_established', { message: `SSE connection successful for user ${userId}` });

      // Ping periódico para mantener viva la conexión
      const pingInterval = setInterval(() => {
        sendEvent('ping', { timestamp: Date.now() });
      }, 25000); // 25 segundos

      // Limpieza cuando el cliente se desconecta
      req.signal.onabort = () => {
        cleanup();
      };

      function cleanup() {
        console.log(`SSE: Cleaning up for user ${userId} on channel ${channelName}.`);
        clearInterval(pingInterval);
        redisSubscriber.removeListener('message', handleRedisMessage); // ¡Muy importante!
        redisSubscriber.unsubscribe(channelName)
          .then(count => console.log(`SSE: Unsubscribed from ${channelName}. Remaining subscriptions: ${count}`))
          .catch(err => console.error(`SSE: Error unsubscribing from ${channelName}:`, err));
        try {
          if (!controller.desiredSize === null || controller.desiredSize! <= 0) { // Check if stream is not already closed or errored
             // controller.close(); // El stream se cierra cuando el cliente aborta.
          }
        } catch (e) {
            console.log(`SSE: Error closing stream for user ${userId}:`, e);
        }
      }
    },
    cancel(reason) {
      console.log(`SSE Stream for user (unknown at this point if userId not captured before cancel): Cancelled by client or server.`, reason);
      // La limpieza debería ocurrir a través de onabort si es posible, o aquí si se puede identificar la suscripción.
      // Es más difícil limpiar aquí si no se capturó el userId y channelName en el scope de start.
      // Por eso, la limpieza en onabort (dentro de start) es más fiable.
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store', // 'no-cache' es bueno, 'no-store' es más fuerte
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Para Nginx
    },
  });
}