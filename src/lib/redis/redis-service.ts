// src/lib/redis/redis-service.ts
import { Redis as UpstashRedis } from '@upstash/redis'
import Redis from 'ioredis'

import { ConfigurationError } from '@/lib/exceptions/configuration-error'
import { getServiceConfig } from '@/services/env/env-service'

import type { SetCommandOptions } from '@upstash/redis';

interface RedisClients {
  restClient: UpstashRedis | null
  publisher: Redis | null
  subscriber: Redis | null
}

interface RedisSetOptions {
  ex?: number  // TTL en segundos
  px?: number  // TTL en milisegundos
  nx?: boolean // Solo si no existe
  xx?: boolean // Solo si existe
}

class RedisService {
  private static instance: RedisService
  private clients: RedisClients = {
    restClient: null,
    publisher: null,
    subscriber: null
  }
  private isInitialized = false

  private constructor() {}

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService()
    }
    return RedisService.instance
  }

  private initialize(required = false): void {
    if (this.isInitialized) return

    const config = getServiceConfig('redis', {
      logErrors: true,
      throwOnMissing: required
    })

    if (config.available) {
      try {
        // Inicializar cliente REST para operaciones simples
        if (config.env.UPSTASH_REDIS_REST_URL && config.env.UPSTASH_REDIS_REST_TOKEN) {
          this.clients.restClient = UpstashRedis.fromEnv()
        }

        // Inicializar clientes ioredis para pub/sub
        if (config.env.UPSTASH_REDIS_URL) {
          // Configuración optimizada para Upstash y entornos serverless
          const ioredisConfig = {
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            lazyConnect: true,
            retryDelayOnClusterDown: 100,
            connectTimeout: 10000,
            // Configuraciones específicas para TLS (Upstash usa conexiones seguras)
            tls: {
              rejectUnauthorized: false
            },
            // Configuraciones de reconexión
            retryConfig: {
              retries: 3,
              factor: 2,
              minTimeout: 1 * 1000,
              maxTimeout: 30 * 1000,
              randomize: true,
            }
          }

          this.clients.publisher = new Redis(config.env.UPSTASH_REDIS_URL, ioredisConfig)
          this.clients.subscriber = new Redis(config.env.UPSTASH_REDIS_URL, ioredisConfig)

          this.setupEventHandlers()
        }
      } catch (error) {
        const configError = ConfigurationError.RedisConnectionFailed(
          'redis-service.ts',
          'initialize',
          error instanceof Error ? error.message : 'Unknown error'
        )
        
        if (required) {
          throw configError
        } else {
          console.warn('Redis connection failed, continuing without cache:', configError.message)
          this.resetClients()
        }
      }
    } else if (required) {
      throw ConfigurationError.ServiceUnavailable('Redis', 'redis-service.ts', 'initialize')
    }

    this.isInitialized = true
  }

  private setupEventHandlers(): void {
    if (this.clients.publisher) {
      this.clients.publisher.on('error', (err) => {
        console.error('Redis Publisher Error:', err)
      })

      this.clients.publisher.on('connect', () => {
        console.log('Redis Publisher connected')
      })

      this.clients.publisher.on('ready', () => {
        console.log('Redis Publisher ready')
      })

      this.clients.publisher.on('close', () => {
        console.log('Redis Publisher connection closed')
      })
    }

    if (this.clients.subscriber) {
      this.clients.subscriber.on('error', (err) => {
        console.error('Redis Subscriber Error:', err)
      })

      this.clients.subscriber.on('connect', () => {
        console.log('Redis Subscriber connected')
      })

      this.clients.subscriber.on('ready', () => {
        console.log('Redis Subscriber ready')
      })

      this.clients.subscriber.on('close', () => {
        console.log('Redis Subscriber connection closed')
      })
    }
  }

  private resetClients(): void {
    this.clients = {
      restClient: null,
      publisher: null,
      subscriber: null
    }
  }

  private buildSetOptions(options?: RedisSetOptions): SetCommandOptions | undefined {
    if (!options) return undefined

    if (options.ex !== undefined) {
      return { ex: options.ex } as SetCommandOptions
    }

    if (options.px !== undefined) {
      return { px: options.px } as SetCommandOptions
    }

    if (options.nx) {
      return { nx: true } as SetCommandOptions
    }

    if (options.xx) {
      return { xx: true } as SetCommandOptions
    }

    return undefined
  }

  // Métodos para operaciones simples (usando cliente REST)
  async get<T>(key: string, required = false): Promise<T | null> {
    this.initialize(required)
    const client = this.clients.restClient
    
    if (!client) {
      if (required) {
        throw ConfigurationError.ServiceUnavailable('Redis REST client', 'redis-service.ts', 'get')
      }
      return null
    }

    try {
      return await client.get<T>(key)
    } catch (error) {
      if (required) {
        throw ConfigurationError.RedisConnectionFailed(
          'redis-service.ts',
          'get',
          error instanceof Error ? error.message : 'Failed to get value'
        )
      }
      console.warn(`Redis get failed for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, options?: RedisSetOptions, required = false): Promise<boolean> {
    this.initialize(required)
    const client = this.clients.restClient
    
    if (!client) {
      if (required) {
        throw ConfigurationError.ServiceUnavailable('Redis REST client', 'redis-service.ts', 'set')
      }
      return false
    }

    try {
      const upstashOptions = this.buildSetOptions(options)
      await client.set(key, value, upstashOptions)
      return true
    } catch (error) {
      if (required) {
        throw ConfigurationError.RedisConnectionFailed(
          'redis-service.ts',
          'set',
          error instanceof Error ? error.message : 'Failed to set value'
        )
      }
      console.warn(`Redis set failed for key ${key}:`, error)
      return false
    }
  }

  async del(key: string, required = false): Promise<boolean> {
    this.initialize(required)
    const client = this.clients.restClient
    
    if (!client) {
      if (required) {
        throw ConfigurationError.ServiceUnavailable('Redis REST client', 'redis-service.ts', 'del')
      }
      return false
    }

    try {
      await client.del(key)
      return true
    } catch (error) {
      if (required) {
        throw ConfigurationError.RedisConnectionFailed(
          'redis-service.ts',
          'del',
          error instanceof Error ? error.message : 'Failed to delete value'
        )
      }
      console.warn(`Redis del failed for key ${key}:`, error)
      return false
    }
  }

  // Métodos para pub/sub (usando ioredis)
  async publish(channel: string, message: string, required = false): Promise<boolean> {
    this.initialize(required)
    const publisher = this.clients.publisher
    
    if (!publisher) {
      if (required) {
        throw ConfigurationError.ServiceUnavailable('Redis Publisher', 'redis-service.ts', 'publish')
      }
      return false
    }

    try {
      await publisher.publish(channel, message)
      return true
    } catch (error) {
      if (required) {
        throw ConfigurationError.RedisConnectionFailed(
          'redis-service.ts',
          'publish',
          error instanceof Error ? error.message : 'Failed to publish message'
        )
      }
      console.warn(`Redis publish failed for channel ${channel}:`, error)
      return false
    }
  }

  async subscribe(channel: string, callback: (message: string) => void, required = false): Promise<boolean> {
    this.initialize(required)
    const subscriber = this.clients.subscriber
    
    if (!subscriber) {
      if (required) {
        throw ConfigurationError.ServiceUnavailable('Redis Subscriber', 'redis-service.ts', 'subscribe')
      }
      return false
    }

    try {
      await subscriber.subscribe(channel)
      subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message)
        }
      })
      return true
    } catch (error) {
      if (required) {
        throw ConfigurationError.RedisConnectionFailed(
          'redis-service.ts',
          'subscribe',
          error instanceof Error ? error.message : 'Failed to subscribe to channel'
        )
      }
      console.warn(`Redis subscribe failed for channel ${channel}:`, error)
      return false
    }
  }

  async unsubscribe(channel: string, required = false): Promise<boolean> {
    this.initialize(required)
    const subscriber = this.clients.subscriber
    
    if (!subscriber) {
      if (required) {
        throw ConfigurationError.ServiceUnavailable('Redis Subscriber', 'redis-service.ts', 'unsubscribe')
      }
      return false
    }

    try {
      await subscriber.unsubscribe(channel)
      return true
    } catch (error) {
      if (required) {
        throw ConfigurationError.RedisConnectionFailed(
          'redis-service.ts',
          'unsubscribe',
          error instanceof Error ? error.message : 'Failed to unsubscribe from channel'
        )
      }
      console.warn(`Redis unsubscribe failed for channel ${channel}:`, error)
      return false
    }
  }

  // Métodos de utilidad
  isRestClientAvailable(): boolean {
    this.initialize(false)
    return this.clients.restClient !== null
  }

  isPubSubAvailable(): boolean {
    this.initialize(false)
    return this.clients.publisher !== null && this.clients.subscriber !== null
  }

  isAvailable(): boolean {
    return this.isRestClientAvailable() || this.isPubSubAvailable()
  }

  getRestClient(required = false): UpstashRedis | null {
    this.initialize(required)
    return this.clients.restClient
  }

  getPublisher(required = false): Redis | null {
    this.initialize(required)
    return this.clients.publisher
  }

  getSubscriber(required = false): Redis | null {
    this.initialize(required)
    return this.clients.subscriber
  }

  async disconnect(): Promise<void> {
    try {
      if (this.clients.publisher) {
        await this.clients.publisher.disconnect()
      }
      if (this.clients.subscriber) {
        await this.clients.subscriber.disconnect()
      }
    } catch (error) {
      console.error('Error disconnecting Redis clients:', error)
    }
  }
}

export const redisService = RedisService.getInstance()

// Para compatibilidad con tu código existente
export const redisPublisher = redisService.getPublisher()
export const redisSubscriber = redisService.getSubscriber()