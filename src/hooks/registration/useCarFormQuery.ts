import { useQuery } from '@tanstack/react-query'
import { getBrands, getGroups, getModelDetails, getModels } from '@/actions/car-api/car-api-actions'
import { Brand, Group, Model } from '@/types/car-types'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useCarFormQueries(
  selectedBrand: Brand | null,
  selectedGroup: Group | null,
  selectedModel: Model | null
) {
  const {
    data: brandsData,
    isLoading: isLoadingBrands,
    error: brandsError
  } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    select: (response) => response.success ? response.data : [],
    staleTime: Infinity
  })

  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    error: groupsError
  } = useQuery({
    queryKey: ['groups', selectedBrand?.id],
    queryFn: async () => {
      if (!selectedBrand) return null;
      const response = await getGroups(selectedBrand.id);
      return response;
    },
    select: (response) => response?.success ? response.data : [],
    enabled: !!selectedBrand
  })

  const {
    data: modelsData,
    isLoading: isLoadingModels,
    error: modelsError
  } = useQuery({
    queryKey: ['models', selectedBrand?.id, selectedGroup?.id],
    queryFn: () => selectedBrand && selectedGroup ? getModels(selectedBrand.id, selectedGroup.id) : null,
    select: (response) => response?.success ? response.data : [],
    enabled: !!(selectedBrand && selectedGroup)
  })

  const {
    data: modelDetailsData,
    isLoading: isLoadingDetails,
    error: modelDetailsError
  } = useQuery({
    queryKey: ['modelDetails', selectedModel?.id],
    queryFn: () => selectedModel ? getModelDetails(selectedModel.id) : null,
    select: (response) => response?.success ? response.data : null,
    enabled: !!selectedModel
  })

  // Manejo centralizado de errores
  useEffect(() => {
    if (brandsError) {
      toast.error('Error al cargar las marcas')
    }
    if (groupsError) {
      toast.error('Error al cargar las líneas')
    }
    if (modelsError) {
      toast.error('Error al cargar los modelos')
    }
    if (modelDetailsError) {
      toast.error('Error al cargar los detalles del modelo')
    }
  }, [brandsError, groupsError, modelsError, modelDetailsError])

  return {
    brandsData,
    isLoadingBrands,
    brandsError,
    groupsData,
    isLoadingGroups,
    groupsError,
    modelsData,
    isLoadingModels,
    modelsError,
    modelDetailsData,
    isLoadingDetails,
    modelDetailsError
  }
}