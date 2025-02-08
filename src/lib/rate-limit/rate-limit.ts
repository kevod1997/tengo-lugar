// src/lib/rate-limit/rate-limit.ts

import { Redis } from '@upstash/redis'
import { ServerActionError } from '../exceptions/server-action-error'

//como implementar en la server action
//tengo que pasar el clerkId porque este va a estar siempre presente en la app
//await rateLimitService.checkRateLimit('submit-insurance', clerkId);

interface RateLimitConfig {
    maxRequests: number    // Número máximo de requests
    windowInSeconds: number // Período de tiempo en segundos
}

export class RateLimitService {
    private redis: Redis

    private static LIMITS: Record<string, RateLimitConfig> = {
        'submit-insurance': { maxRequests: 5, windowInSeconds: 60 },    // 5 intentos por minuto
        'upload-document': { maxRequests: 10, windowInSeconds: 300 },   // 10 intentos por 5 minutos
        'create-user': { maxRequests: 3, windowInSeconds: 3600 },       // 3 intentos por hora
        'validate-document': { maxRequests: 20, windowInSeconds: 60 },  // 20 validaciones por minuto
        'default': { maxRequests: 100, windowInSeconds: 60 }            // Límite por defecto
    }

    constructor() {
        this.redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        })
    }

    async checkRateLimit(
        actionType: string,
        userId: string
    ): Promise<void> {
        try {
            const key = `rate-limit:${actionType}:${userId}`
            const config = RateLimitService.LIMITS[actionType] || RateLimitService.LIMITS.default

            // Obtener el conteo actual
            const current = await this.redis.incr(key)

            // Si es el primer request, establecer la expiración
            if (current === 1) {
                await this.redis.expire(key, config.windowInSeconds)
            }

            // Si excede el límite, lanzar error
            if (current > config.maxRequests) {
                const ttl = await this.redis.ttl(key)
                throw ServerActionError.RateLimitExceeded(
                    'rate-limit.ts',
                    'checkRateLimit',
                    `Demasiadas solicitudes. Intente nuevamente en ${Math.ceil(ttl)} segundos.`
                )
            }

        } catch (error) {
            if (error instanceof ServerActionError) {
                throw error
            }
            // Si hay un error con Redis, permitir la acción pero logear el error
            console.error('Rate limit check failed:', error)
        }
    }

    async getRemainingRequests(
        actionType: string,
        userId: string
    ): Promise<{ remaining: number; reset: number } | null> {
        try {
            const key = `rate-limit:${actionType}:${userId}`
            const config = RateLimitService.LIMITS[actionType] || RateLimitService.LIMITS.default

            const [current, ttl] = await Promise.all([
                this.redis.get<number>(key),
                this.redis.ttl(key)
            ])

            if (!current) {
                return {
                    remaining: config.maxRequests,
                    reset: 0
                }
            }

            return {
                remaining: Math.max(0, config.maxRequests - current),
                reset: ttl
            }

        } catch (error) {
            console.error('Error getting rate limit info:', error)
            return null
        }
    }
}

// Exportar una instancia única
export const rateLimitService = new RateLimitService()