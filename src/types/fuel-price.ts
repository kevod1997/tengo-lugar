import type { FuelType } from '@prisma/client';

export interface FuelPriceListItem {
  id: string;
  name: string;
  fuelType: FuelType;
  price: number;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelPriceDetail extends FuelPriceListItem {
  regionCode: string | null;
  expirationDate: Date | null;
}

export interface FuelPricesResponse {
  fuelPrices: FuelPriceListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const fuelTypeLabels: Record<FuelType, string> = {
  NAFTA: 'Nafta',
  DIESEL: 'Diésel',
  GNC: 'GNC',
  ELECTRICO: 'Eléctrico',
  HIBRIDO: 'Híbrido',
};

export const fuelTypeColors: Record<FuelType, string> = {
  NAFTA: 'bg-red-100 text-red-800',
  DIESEL: 'bg-blue-100 text-blue-800',
  GNC: 'bg-green-100 text-green-800',
  ELECTRICO: 'bg-purple-100 text-purple-800',
  HIBRIDO: 'bg-yellow-100 text-yellow-800',
};
