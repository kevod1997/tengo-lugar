import Redis from 'ioredis';

// URL de conexión a Upstash Redis
const redisUrl = process.env.UPSTASH_REDIS_URL; // Asegúrate que esta sea la URL correcta para ioredis (no la REST URL)
                                                 // Debería ser algo como: rediss://:<password>@<region>.<id>.upstash.io:<port>
                                                 // O si usas el SDK de Upstash para Redis: @upstash/redis

if (!redisUrl) {
  throw new Error('UPSTASH_REDIS_URL (o la URL de conexión de ioredis) no está definida');
}

// Cliente para publicar mensajes
export const redisPublisher = new Redis(redisUrl, {
  // Opciones de ioredis si son necesarias, ej. TLS para Upstash
  // tls: {}, // ioredis suele manejar rediss:// automáticamente
  maxRetriesPerRequest: null, // Evita que ioredis reintente indefinidamente en algunos casos
  enableReadyCheck: false, // Puede ser útil en entornos serverless
});

// Cliente dedicado para suscribirse a mensajes (evita conflictos con comandos normales)
export const redisSubscriber = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisPublisher.on('error', (err) => console.error('Redis Publisher Error:', err));
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

console.log('Redis clients (publisher & subscriber) configured.');