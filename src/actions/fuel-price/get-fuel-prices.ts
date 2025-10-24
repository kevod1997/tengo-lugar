'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { getFuelPricesSchema } from "@/schemas/validation/fuel-price-schema";
import { FuelPricesResponse } from "@/types/fuel-price";
import { Prisma } from "@prisma/client";

interface GetFuelPricesParams {
  page?: number;
  pageSize?: number;
  fuelType?: string;
  isActive?: boolean;
  searchTerm?: string;
}

export async function getFuelPrices(params: GetFuelPricesParams) {
  try {
    await requireAuthorization('admin', 'get-fuel-prices.ts', 'getFuelPrices');

    const validatedParams = getFuelPricesSchema.parse({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      fuelType: params.fuelType || undefined,
      isActive: params.isActive,
      searchTerm: params.searchTerm || '',
    });

    const { page, pageSize, fuelType, isActive, searchTerm } = validatedParams;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.FuelPriceWhereInput = {
      ...(fuelType && { fuelType }),
      ...(isActive !== undefined && { isActive }),
      ...(searchTerm && {
        name: {
          contains: searchTerm,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    // Execute queries in parallel
    const [fuelPrices, total] = await Promise.all([
      prisma.fuelPrice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { isActive: 'desc' },
          { effectiveDate: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          name: true,
          fuelType: true,
          price: true,
          effectiveDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.fuelPrice.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    const response: FuelPricesResponse = {
      fuelPrices,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };

    return ApiHandler.handleSuccess(response, 'Precios de combustible obtenidos exitosamente');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
