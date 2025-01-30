// 'use client'

// import { useState } from 'react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Brand } from '@/lib/infoauto/infoauto-types';

// interface BrandSelectorProps {
//     brands: Brand[];
//     onSelect: (brandId: number) => Promise<JSX.Element>;
//   }
  
//   export function BrandSelector({ brands, onSelect }: BrandSelectorProps) {
//     const [selectedModels, setSelectedModels] = useState<JSX.Element | null>(null);
  
//     if (brands.length === 0) {
//       return <p>No hay marcas disponibles en este momento.</p>;
//     }
  
//     const handleSelect = async (value: string) => {
//       const brandId = parseInt(value);
//       const modelList = await onSelect(brandId);
//       setSelectedModels(modelList);
//     };
  
//     return (
//       <div>
//         <Select onValueChange={handleSelect}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Selecciona una marca" />
//           </SelectTrigger>
//           <SelectContent>
//             {brands.map((brand) => (
//               <SelectItem key={brand.id} value={brand.id.toString()}>
//                 {brand.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {selectedModels}
//       </div>
//     );
//   }
  