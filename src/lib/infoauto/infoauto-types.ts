import { z } from 'zod';

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo_url: z.string().url().nullable(),
});

export const GroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  summary: z.string().nullable().optional(),
});

export const ModelSchema = z.object({
  as_codia: z.boolean(),
  codia: z.union([z.string(), z.number()]).transform(val => val.toString()),
  brand: z.object({
    id: z.number(),
    name: z.string(),
    summary: z.string().nullable().optional(),
  }),
  description: z.string(),
  features: z.array(z.number()),
  group: z.object({
    id: z.number(),
    name: z.string(),
    summary: z.string().nullable().optional(),
  }),
  list_price: z.boolean(),
  photo_url: z.string().url().nullable(),
  prices: z.boolean(),
  prices_from: z.number().nullable(),
  prices_to: z.number().nullable(),
  position: z.number(),
  r_codia: z.union([z.string(), z.number(), z.null()]).nullable(),
  summary: z.string().nullable().optional(),
  similarity: z.number().optional(),
  year: z.number().optional(),
});

export const FeatureSchema = z.object({
  id: z.number(),
  category_name: z.string(),
  description: z.string(),
  type: z.string(),
  position: z.number(),
  length: z.number().nullable(),
  decimals: z.number().nullable().optional(),
  value: z.union([z.string(), z.number()]).nullable(),
  value_description: z.string().nullable().optional(),
});

export type Brand = z.infer<typeof BrandSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Model = z.infer<typeof ModelSchema>;
export type Feature = z.infer<typeof FeatureSchema>;

