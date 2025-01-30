import { BrandsResponse, GroupsResponse, ModelsResponse, DetailedModelResponse } from '@/types/car-types';

export const mockVehicleService = {
  getBrands: async (): Promise<BrandsResponse> => {
    return {
      success: true,
      data: [
        { id: 1, name: "Toyota" },
        { id: 2, name: "Honda" }
      ]
    };
  },

  getGroups: async (brandId: number): Promise<GroupsResponse> => {
    return {
      success: true,
      data: [
        { id: 1, name: "Focus", brandId: brandId },
        { id: 2, name: "Mondeo", brandId: brandId },
        { id: 3, name: "Fiesta", brandId: brandId }
      ]
    };
  },

  getModels: async (brandId: number, groupId: number): Promise<ModelsResponse> => {
    return {
      success: true,
      data: [
        { id: 1, name: "Focus 1.6", brandId: brandId, groupId: groupId },
        { id: 2, name: "Focus 1.6 GTI", brandId: brandId, groupId: groupId },
        { id: 3, name: "Focus 2.0 Titanium", brandId: brandId, groupId: groupId }
      ]
    };
  },

  getModelDetails: async (modelId: number): Promise<DetailedModelResponse> => {
    return {
      success: true,
      data: {
        id: modelId,
        name: "Focus 1.6",
        transmission: "Manual",
        fuelConsume: null,
        fuelType: null,
        brand: { id: 1, name: "Ford" },
        group: { id: 1, name: "Focus", brandId: 1 },
        years: [
          { id: 1, year: 2020 },
          { id: 2, year: 2021 },
          { id: 3, year: 2022 }
        ]
      }
    };
  }
};

