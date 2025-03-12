'use server'

import { ApiHandler } from '@/lib/api-handler'
import { ServerActionError } from '@/lib/exceptions/server-action-error'
import { fetchFromCarApi } from '@/services/car-api/car-api-service'
import { BrandsResponse, GroupsResponse, ModelsResponse, DetailedModelResponse } from '@/types/car-types'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const CACHE_TIMES = {
  BRANDS: 60 * 60 * 24,    // 24 horas
  GROUPS: 60 * 60 * 24,    // 24 horas
  MODELS: 60 * 60 * 24,    // 24 horas
  MODEL_DETAILS: 60 * 60 * 24  // 24 horas
} as const

const CACHE_KEYS = {
  BRANDS: 'car_api_brands',
  GROUP: (brandId: number) => `car_api_group_${brandId}`,
  MODELS: (brandId: number, groupId: number) => `car_api_models_${brandId}_${groupId}`,
  MODEL_DETAILS: (modelId: number) => `car_api_model_${modelId}`,
} as const

// Funciones auxiliares para fetch y caché
async function fetchAndCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cacheTime: number
): Promise<T> {
  const response = await fetchFn()

  await redis.set(cacheKey, response, {
    ex: cacheTime
  }).catch(console.warn)

  return response
}

// Función para obtener marcas
export async function getBrands(): Promise<BrandsResponse> {
  try {
    const cached = await redis.get<BrandsResponse>(CACHE_KEYS.BRANDS)

    if (cached) {
      // Verificar si necesitamos actualizar en segundo plano
      const ttl = await redis.ttl(CACHE_KEYS.BRANDS)
      if (ttl < CACHE_TIMES.BRANDS / 2) {
        fetchAndCache(
          CACHE_KEYS.BRANDS,
          async () => {
            const response = await fetchFromCarApi('/brands')
            return ApiHandler.handleSuccess(response.data)
          },
          CACHE_TIMES.BRANDS
        ).catch(console.error)
      }
      return cached
    }

    return await fetchAndCache(
      CACHE_KEYS.BRANDS,
      async () => {
        const response = await fetchFromCarApi('/brands')
        return ApiHandler.handleSuccess(response.data)
      },
      CACHE_TIMES.BRANDS
    )
  } catch (error) {
    return ApiHandler.handleError(
      ServerActionError.FetchingFailed(
        'car-actions.ts',
        'getBrands',
        error instanceof Error ? error.message : String(error)
      )
    )
  }
}

// Función para obtener grupos
export async function getGroups(brandId: number): Promise<GroupsResponse> {
  try {
    const cacheKey = CACHE_KEYS.GROUP(brandId);
    const cached = await redis.get<GroupsResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await fetchFromCarApi(`/groups?brandId=${brandId}`);

    return await fetchAndCache(
      cacheKey,
      async () => {
        return ApiHandler.handleSuccess(response.data);
      },
      CACHE_TIMES.GROUPS
    );
  } catch (error) {
    return ApiHandler.handleError(
      ServerActionError.FetchingFailed(
        'car-actions.ts',
        'getGroups',
        error instanceof Error ? error.message : String(error)
      )
    );
  }
}

export async function getModels(brandId: number, groupId: number): Promise<ModelsResponse> {
  try {
    const cacheKey = CACHE_KEYS.MODELS(brandId, groupId)
    const cached = await redis.get<ModelsResponse>(cacheKey)

    if (cached) {
      const ttl = await redis.ttl(cacheKey)
      if (ttl < CACHE_TIMES.MODELS / 2) {
        fetchAndCache(
          cacheKey,
          async () => {
            const response = await fetchFromCarApi(`/models?brandId=${brandId}&groupId=${groupId}`)

            return ApiHandler.handleSuccess(response.data)
          },
          CACHE_TIMES.MODELS
        ).catch(console.error)
      }
      return cached
    }

    return await fetchAndCache(
      cacheKey,
      async () => {
        const response = await fetchFromCarApi(`/models?brandId=${brandId}&groupId=${groupId}`)
        return ApiHandler.handleSuccess(response.data)
      },
      CACHE_TIMES.MODELS
    )

  } catch (error) {
    return ApiHandler.handleError(
      ServerActionError.FetchingFailed(
        'car-actions.ts',
        'getModels',
        error instanceof Error ? error.message : String(error)
      )
    )
  }
}

export async function getModelDetails(modelId: number): Promise<DetailedModelResponse> {
  try {
    //TODO VER SI EL MODELO NO TRAE LA DATA DEL CONSUMO PORQUE ESTA CACEHADO
    const cacheKey = CACHE_KEYS.MODEL_DETAILS(modelId)
    const cached = await redis.get<DetailedModelResponse>(cacheKey)

    if (cached) {
      const ttl = await redis.ttl(cacheKey)
      if (ttl < CACHE_TIMES.MODEL_DETAILS / 2) {
        fetchAndCache(
          cacheKey,
          async () => {
            const response = await fetchFromCarApi(`/models/${modelId}`)
            return ApiHandler.handleSuccess(response.data)
          },
          CACHE_TIMES.MODEL_DETAILS
        ).catch(console.error)
      }
      return cached
    }

    return await fetchAndCache(
      cacheKey,
      async () => {
        const response = await fetchFromCarApi(`/models/${modelId}`)
        return ApiHandler.handleSuccess(response.data)
      },
      CACHE_TIMES.MODEL_DETAILS
    )
  } catch (error) {
    return ApiHandler.handleError(
      ServerActionError.FetchingFailed(
        'car-actions.ts',
        'getModelDetails',
        error instanceof Error ? error.message : String(error)
      )
    )
  }
}