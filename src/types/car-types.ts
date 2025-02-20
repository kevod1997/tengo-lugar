import { FuelType } from "@prisma/client";
import { ApiResponse } from "./api-types";

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
  fuelType: FuelType | undefined;
  fuelConsume: number;
  brand: Brand;
  group: {
    id: number;
    name: string;
  };
}


export type BrandsResponse = ApiResponse<Brand[]>;
export type GroupsResponse = ApiResponse<Group[]>;
export type ModelsResponse = ApiResponse<Model[]>;
export type DetailedModelResponse = ApiResponse<DetailedModel>;