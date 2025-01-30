
// import Image from 'next/image';
// import { Model } from '@/lib/infoauto/infoauto-types';

// interface ModelListProps {
//     models: Model[];
//     selectedYear: number | null;
//   }
  
//   export function ModelList({ models, selectedYear }: ModelListProps) {

//     if (models.length === 0) {
//       return <p>No hay modelos disponibles en este momento.</p>;
//     }

//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {models.map((model) => (
//           <div key={model.codia} className="border rounded-lg p-4 flex flex-col">
//             {model.photo_url ? (
//               <Image src={model.photo_url} alt={model.description} width={200} height={150} className="object-cover mb-2 rounded" />
//             ) : (
//               <div className="w-200 h-150 bg-gray-200 flex items-center justify-center mb-2 rounded">
//                 <span className="text-gray-500">No image available</span>
//               </div>
//             )}
//             <h3 className="font-semibold">{model.description}</h3>
//             <p className="text-sm text-gray-600">CODIA: {model.codia}</p>
//             {model.as_codia && <p className="text-xs text-blue-600">Asimilado</p>}
//           </div>
//         ))}
//       </div>
//     );
//   }
  