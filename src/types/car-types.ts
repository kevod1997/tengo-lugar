import { ApiResponse } from "@/types/api-types";
import { FuelType } from "@prisma/client";

export interface Brand {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  brandId: number;
}

export interface Model {
  id: number;
  name: string;
  brandId: number;
  groupId: number;
}

export interface DetailedModel {
  id: number;
  name: string;
  transmission: string;
  fuelConsume: number | undefined;
  fuelType: FuelType | undefined;
  brand: Brand;
  group: Group;
  years: Array<{ id: number; year: number }>;
}

export type BrandsResponse = ApiResponse<Brand[]>;
export type GroupsResponse = ApiResponse<Group[]>;
export type ModelsResponse = ApiResponse<Model[]>;
export type DetailedModelResponse = ApiResponse<DetailedModel>;
