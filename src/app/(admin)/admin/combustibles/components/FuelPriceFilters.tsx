'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fuelTypeLabels } from '@/types/fuel-price'

export function FuelPriceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }

    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/admin/combustibles')
  }

  const hasActiveFilters =
    searchParams.has('fuelType') ||
    searchParams.has('isActive') ||
    searchParams.has('search')

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nombre del precio..."
              className="pl-8"
              defaultValue={searchParams.get('search') || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Fuel Type Filter */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="fuelType">Tipo de Combustible</Label>
          <Select
            value={searchParams.get('fuelType') || 'ALL'}
            onValueChange={(value) => handleFilterChange('fuelType', value)}
          >
            <SelectTrigger id="fuelType">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {Object.entries(fuelTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="isActive">Estado</Label>
          <Select
            value={searchParams.get('isActive') || 'ALL'}
            onValueChange={(value) => handleFilterChange('isActive', value)}
          >
            <SelectTrigger id="isActive">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <div className="flex flex-col gap-2">
          <Label>&nbsp;</Label>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}
