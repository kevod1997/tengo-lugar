import { redisPublisher } from '@/lib/redis';
import { SseEventData } from '@/types/sse-types';

interface RedisEventMessage<T extends SseEventData> {
  eventName: string; // ej: 'user_verification_update'
  payload: T;
}

export async function publishUserEvent<T extends SseEventData>(
  userId: string,
  eventName: string,
  payload: T
): Promise<void> {
  if (!userId) {
    console.warn('SSE Publisher: Attempted to publish event without userId.');
    return;
  }

  const channel = `user-updates:${userId}`;
  const message: RedisEventMessage<T> = { eventName, payload };

  try {
    const result = await redisPublisher.publish(channel, JSON.stringify(message));
    console.log(`SSE Publisher: Published to ${channel} (listeners: ${result}):`, message);
    if (result === 0) {
        console.log(`SSE Publisher: No active listeners on Redis channel ${channel} for this event.`);
    }
  } catch (error) {
    console.error(`SSE Publisher: Error publishing to Redis channel ${channel}:`, error);
  }
}