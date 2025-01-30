// 'use client'

// import { useState } from 'react'
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Brand, Group, Model, Feature } from '@/lib/infoauto/infoauto-types'
// import { getGroupsByBrand, getModelFeatures, getModelsByBrandAndGroup } from '@/actions/infoauto/infoauto-actions'

// interface VehicleModalProps {
//     brands: Brand[]
//   }
  
//   export function VehicleModal({ brands }: VehicleModalProps) {
//     const [groups, setGroups] = useState<Group[]>([])
//     const [models, setModels] = useState<Model[]>([])
//     const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
//     const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
//     const [selectedModel, setSelectedModel] = useState<Model | null>(null)
//     const [features, setFeatures] = useState<Feature[]>([])
//     const [isLoading, setIsLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)
  
//     const handleBrandSelect = async (brandId: string) => {
//       setIsLoading(true)
//       setError(null)
//       const id = parseInt(brandId)
//       setSelectedBrand(id)
//       setSelectedGroup(null)
//       setSelectedModel(null)
//       setFeatures([])
      
//       try {
//         const fetchedGroups = await getGroupsByBrand(id)
//         setGroups(fetchedGroups)
//       } catch (err) {
//         console.error('Error fetching groups:', err)
//         setError('Error al cargar los grupos. Por favor, intente de nuevo.')
//       }
//       setIsLoading(false)
//     }
  
//     const handleGroupSelect = async (groupId: string) => {
//       setIsLoading(true)
//       setError(null)
//       const id = parseInt(groupId)
//       setSelectedGroup(id)
//       setSelectedModel(null)
//       setFeatures([])
  
//       if (selectedBrand) {
//         try {
//           const fetchedModels = await getModelsByBrandAndGroup(selectedBrand, id)
//           setModels(fetchedModels)
//         } catch (err) {
//           console.error('Error fetching models:', err)
//           setError('Error al cargar los modelos. Por favor, intente de nuevo.')
//         }
//       }
//       setIsLoading(false)
//     }
  
//     const handleModelSelect = async (codia: string) => {
//       setIsLoading(true)
//       setError(null)
//       const model = models.find(m => m.codia === codia)
//       setSelectedModel(model || null)
      
//       if (model) {
//         try {
//           const modelFeatures = await getModelFeatures(model.codia)
//           setFeatures(modelFeatures)
//         } catch (err) {
//           console.error('Error fetching model features:', err)
//           setError('Error al cargar las características del modelo. Por favor, intente de nuevo.')
//         }
//       }
//       setIsLoading(false)
//     }
  
//     const renderFeatureValue = (feature: Feature) => {
//       if (feature.type === 'choice') {
//         return feature.value_description || feature.value;
//       } else if (feature.type === 'decimal') {
//         return `${feature.value} ${feature.description.includes('litros') ? 'L/100km' : ''}`;
//       }
//       return feature.value;
//     }
  
//     return (
//       <Dialog>
//         <DialogTrigger asChild>
//           <Button variant="outline">Seleccionar Vehículo</Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-[600px]">
//           <DialogHeader>
//             <DialogTitle>Selección de Vehículo</DialogTitle>
//           </DialogHeader>
          
//           <div className="space-y-6">
//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//                 <span className="block sm:inline">{error}</span>
//               </div>
//             )}
  
//             <Select onValueChange={handleBrandSelect} disabled={isLoading}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Selecciona una marca" />
//               </SelectTrigger>
//               <SelectContent>
//                 {brands.map((brand) => (
//                   <SelectItem key={brand.id} value={brand.id.toString()}>
//                     {brand.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
  
//             {selectedBrand && (
//               <Select onValueChange={handleGroupSelect} disabled={isLoading}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Selecciona un grupo" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {groups.map((group) => (
//                     <SelectItem key={group.id} value={group.id.toString()}>
//                       {group.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
  
//             {selectedGroup && (
//               <ScrollArea className="h-[300px] rounded-md border p-4">
//                 {isLoading ? (
//                   <div className="flex items-center justify-center h-full">
//                     <p>Cargando modelos...</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {models.map((model) => (
//                       <Button
//                         key={model.codia}
//                         variant={selectedModel?.codia === model.codia ? "default" : "ghost"}
//                         className="w-full justify-start"
//                         onClick={() => handleModelSelect(model.codia)}
//                       >
//                         {model.description}
//                       </Button>
//                     ))}
//                   </div>
//                 )}
//               </ScrollArea>
//             )}
  
//             {selectedModel && features.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="font-semibold mb-2">Características del Modelo</h3>
//                 <div className="space-y-2">
//                   {features.map((feature) => (
//                     <div key={feature.id} className="flex justify-between items-center py-2 border-b last:border-0">
//                       <span className="font-medium">{feature.description}</span>
//                       <span className="text-sm text-gray-600">{renderFeatureValue(feature)}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     )
//   }
  
  