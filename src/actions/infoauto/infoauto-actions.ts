// 'use server'

// import { ApiHandler } from '@/lib/api-handler';
// import { fetchFromInfoAuto } from '../../lib/infoauto/infoauto-service';
// import { BrandSchema, FeatureSchema, GroupSchema, ModelSchema } from '../../lib/infoauto/infoauto-types';
// import { z } from 'zod';
// import { ServerActionError } from '@/lib/exceptions/server-action-error';

// export async function getBrands() {
//   try {
//     const data = await fetchFromInfoAuto('/brands/');
//     return z.array(BrandSchema).parse(data);
//   } catch (error) {
//     console.error('Error in getBrands:', error);
//     ApiHandler.handleError(
//       ServerActionError.FetchingFailed(
//         `${error instanceof Error ? error.message : String(error)}`
//       )
//     );
//     return [];
//   }
// }

// export async function getGroupsByBrand(brandId: number) {
//   try {
//     const data = await fetchFromInfoAuto(`/brands/${brandId}/groups/`);
//     return z.array(GroupSchema).parse(data);
//   } catch (error) {
//     console.error('Error in getGroupsByBrand:', error);
//     return [];
//   }
// }

// export async function getModelsByBrandAndGroup(brandId: number, groupId: number) {
//   try {
//     const data = await fetchFromInfoAuto(`/brands/${brandId}/groups/${groupId}/models/`);
//     return z.array(ModelSchema).parse(data);
//   } catch (error) {
//     console.error('Error in getModelsByBrandAndGroup:', error);
//     if (error instanceof z.ZodError) {
//       console.error('Zod validation errors:', error.errors);
//     }
//     return [];
//   }
// }

// export async function getModelFeatures(codia: string) {
//   try {
//     const requestedFeatures = ['1', '71', '72', '73'];
//     const queryParams = new URLSearchParams(
//       requestedFeatures.map(id => [`feature_${id}`, 'true'])
//     );
//     const data = await fetchFromInfoAuto(`/models/${codia}/features?${queryParams}`);

//     const filteredData = data.filter((feature: any) =>
//       requestedFeatures.includes(feature.id.toString())
//     );

//     return z.array(FeatureSchema).parse(filteredData);
//   } catch (error) {
//     console.error('Error in getModelFeatures:', error);
//     if (error instanceof z.ZodError) {
//       console.error('Zod validation errors:', error.errors);
//     }
//     return [];
//   }
// }
