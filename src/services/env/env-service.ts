// lib/env-services.ts
import { ConfigurationError } from '@/lib/exceptions/configuration-error'
import { logError } from '@/services/logging/logging-service'

// Definir todos los servicios y sus variables requeridas
const SERVICE_CONFIGS = {
  googleMaps: {
    required: ['GOOGLE_MAPS_API_KEY'],
    optional: []
  },
  carApi: {
    required: ['CAR_API_URL', 'CAR_API_USERNAME', 'CAR_API_PASSWORD'],
    optional: []
  },
  redis: {
    required: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'UPSTASH_REDIS_URL', 'UPSTASH_REDIS_REST_PORT'],
    optional: []
  },
  database: {
    required: ['DATABASE_URL'],
    optional: []
  },
  auth: {
    required: ['NEXTAUTH_SECRET'],
    optional: ['NEXTAUTH_URL']
  },
  email: {
    required: ['BREVO_API_KEY'],
    optional: []
  },
  storage: {
    required: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_BUCKET_NAME'],
    optional: []
  }
} as const

// Tipos para type safety
type ServiceName = keyof typeof SERVICE_CONFIGS
type ServiceResult<T extends ServiceName> = {
  available: boolean
  env: T extends 'googleMaps'
  ? { GOOGLE_MAPS_API_KEY?: string }
  : T extends 'carApi'
  ? { CAR_API_URL?: string; CAR_API_USERNAME?: string; CAR_API_PASSWORD?: string }
  : T extends 'redis'
  ? { UPSTASH_REDIS_REST_URL?: string; UPSTASH_REDIS_REST_TOKEN?: string; UPSTASH_REDIS_URL?: string; UPSTASH_REDIS_REST_PORT?: string }
  : T extends 'database'
  ? { DATABASE_URL?: string }
  : T extends 'auth'
  ? { NEXTAUTH_SECRET?: string; NEXTAUTH_URL?: string }
  : T extends 'email'
  ? { BREVO_API_KEY?: string }
  : T extends 'storage'
  ? { AWS_ACCESS_KEY_ID?: string; AWS_SECRET_ACCESS_KEY?: string; AWS_REGION?: string; AWS_BUCKET_NAME?: string }
  : Record<string, string | undefined>
  missing: string[]
}

// Función principal que valida y devuelve env vars
export function getServiceConfig<T extends ServiceName>(
  serviceName: T,
  options: { logErrors?: boolean; throwOnMissing?: boolean } = {}
): ServiceResult<T> {
  const { logErrors = true, throwOnMissing = false } = options
  const config = SERVICE_CONFIGS[serviceName]

  const env: Record<string, string | undefined> = {}
  const missing: string[] = []

  // Verificar variables requeridas
  for (const envVar of config.required) {
    const value = process.env[envVar]
    env[envVar] = value
    if (!value) {
      missing.push(envVar)
    }
  }

  // Agregar variables opcionales si existen
  for (const envVar of config.optional) {
    env[envVar] = process.env[envVar]
  }

  const available = missing.length === 0

  // Log errors si hay variables faltantes
  if (!available && logErrors) {
    const error = ConfigurationError.MissingEnvironmentVariables(
      serviceName,
      missing,
      'env-services.ts',
      'getServiceConfig'
    )

    logError({
      origin: error.origin,
      code: error.code,
      message: error.message,
      details: `Service: ${serviceName}, Missing: ${missing.join(', ')}`,
      fileName: 'env-services.ts',
      functionName: 'getServiceConfig'
    })
  }

  // Throw error si se requiere
  if (!available && throwOnMissing) {
    throw ConfigurationError.MissingEnvironmentVariables(
      serviceName,
      missing,
      'env-services.ts',
      'getServiceConfig'
    )
  }

  return {
    available,
    env: env as ServiceResult<T>['env'],
    missing
  }
}

export function hasRequiredServices() {
  return {
    googleMaps: getServiceConfig('googleMaps', { logErrors: false }).available,
    carApi: getServiceConfig('carApi', { logErrors: false }).available,
    redis: getServiceConfig('redis', { logErrors: false }).available,
    database: getServiceConfig('database', { logErrors: false }).available,
    auth: getServiceConfig('auth', { logErrors: false }).available,
    email: getServiceConfig('email', { logErrors: false }).available,
    storage: getServiceConfig('storage', { logErrors: false }).available,
  }
}

// Helpers específicos para casos comunes
export function getGoogleMapsConfig() {
  const result = getServiceConfig('googleMaps')
  return {
    available: result.available,
    apiKey: result.env.GOOGLE_MAPS_API_KEY,
    missing: result.missing
  }
}

export function getCarApiConfig() {
  const result = getServiceConfig('carApi', { throwOnMissing: false })
  return {
    available: result.available,
    url: result.env.CAR_API_URL!,
    username: result.env.CAR_API_USERNAME!,
    password: result.env.CAR_API_PASSWORD!
  }
}

