'use server'

import { BrandsResponse, GroupsResponse, ModelsResponse, DetailedModelResponse } from '@/types/car-types';
import { FuelType } from '@prisma/client';

const mockBrands = [
  { id: 1, name: "Toyota" },
  { id: 2, name: "Honda" },
  { id: 3, name: "Ford" },
  { id: 4, name: "Volkswagen" },
  { id: 5, name: "Chevrolet" }
];

type MockGroups = {
  [key: number]: Array<{ 
    id: number; 
    name: string; 
    brandId: number;
  }>;
}

const mockGroups: MockGroups  = {
  1: [ // Toyota
    { id: 1, name: "Corolla", brandId: 1 },
    { id: 2, name: "Hilux", brandId: 1 },
    { id: 3, name: "RAV4", brandId: 1 }
  ],
  2: [ // Honda
    { id: 4, name: "Civic", brandId: 2 },
    { id: 5, name: "CR-V", brandId: 2 },
    { id: 6, name: "HR-V", brandId: 2 }
  ],
  3: [ // Ford
    { id: 7, name: "Focus", brandId: 3 },
    { id: 8, name: "Ranger", brandId: 3 },
    { id: 9, name: "Territory", brandId: 3 }
  ],
  4: [ // Volkswagen
    { id: 10, name: "Golf", brandId: 4 },
    { id: 11, name: "Amarok", brandId: 4 },
    { id: 12, name: "Vento", brandId: 4 }
  ],
  5: [ // Chevrolet
    { id: 13, name: "Cruze", brandId: 5 },
    { id: 14, name: "S10", brandId: 5 },
    { id: 15, name: "Tracker", brandId: 5 }
  ]
};

type MockModels = {
  [key: string]: Array<{
    id: number;
    name: string;
    brandId: number;
    groupId: number;
  }>;
}

const mockModels: MockModels = {
  // Toyota Corolla
  "1-1": [
    { id: 1, name: "Corolla XLI", brandId: 1, groupId: 1 },
    { id: 2, name: "Corolla SEG", brandId: 1, groupId: 1 },
    { id: 3, name: "Corolla GR-Sport", brandId: 1, groupId: 1 }
  ],
  // Honda Civic
  "2-4": [
    { id: 4, name: "Civic EX", brandId: 2, groupId: 4 },
    { id: 5, name: "Civic Sport", brandId: 2, groupId: 4 },
    { id: 6, name: "Civic SI", brandId: 2, groupId: 4 }
  ],
  // Ford Focus
  "3-7": [
    { id: 7, name: "Focus Titanium", brandId: 3, groupId: 7 },
    { id: 8, name: "Focus ST", brandId: 3, groupId: 7 },
    { id: 9, name: "Focus RS", brandId: 3, groupId: 7 }
  ]
};

// Primero definimos los años disponibles
const AVAILABLE_YEARS = {
  2018: { id: 1, year: 2018 },
  2019: { id: 2, year: 2019 },
  2020: { id: 3, year: 2020 },
  2021: { id: 4, year: 2021 },
  2022: { id: 5, year: 2022 },
  2023: { id: 6, year: 2023 }
} as const;

type MockModelDetails = {
  [key: number]: {
    id: number;
    name: string;
    transmission: string;
    fuelConsume: number| undefined;
    fuelType: FuelType | undefined;
    brand: typeof mockBrands[number];
    group: MockGroups[number][number];
    years: typeof AVAILABLE_YEARS[keyof typeof AVAILABLE_YEARS][];
  };
}

const mockModelDetails: MockModelDetails  = {
  1: {
    id: 1,
    name: "Corolla XLI",
    transmission: "Automática",
    fuelConsume: undefined,
    fuelType: undefined,
    brand: mockBrands[0],
    group: mockGroups[1][0],
    years: [
      AVAILABLE_YEARS[2020],
      AVAILABLE_YEARS[2021],
      AVAILABLE_YEARS[2022],
      AVAILABLE_YEARS[2023]
    ]
  },
  4: {
    id: 4,
    name: "Civic EX",
    transmission: "Manual",
    fuelConsume: 5.8,
    fuelType: 'NAFTA',
    brand: mockBrands[1],
    group: mockGroups[2][0],
    years: [
      AVAILABLE_YEARS[2019],
      AVAILABLE_YEARS[2020],
      AVAILABLE_YEARS[2021],
      AVAILABLE_YEARS[2022]
    ]
  }
};

export async function getBrands(): Promise<BrandsResponse> {
  return {
    success: true,
    data: mockBrands
  };
}

export async function getGroups(brandId: number): Promise<GroupsResponse> {
  return {
    success: true,
    data: mockGroups[brandId] || []
  };
}

export async function getModels(brandId: number, groupId: number): Promise<ModelsResponse> {
  const key = `${brandId}-${groupId}`;
  return {
    success: true,
    data: mockModels[key] || []
  };
}

export async function getModelDetails(modelId: number): Promise<DetailedModelResponse> {
  return {
    success: true,
    data: mockModelDetails[modelId] || null
  };
}