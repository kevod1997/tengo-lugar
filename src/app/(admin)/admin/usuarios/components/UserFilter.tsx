'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserFilterProps {
  currentFilter: string
}

export function UserFilter({ currentFilter }: UserFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', value)
    params.set('page', '1') // Reset page when filter changes
    router.push(`?${params.toString()}`)
  }

  return (
    <Select value={currentFilter} onValueChange={handleFilterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Seleccionar filtro" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los usuarios</SelectItem>
        <SelectItem value="pending">Verificaciones pendientes</SelectItem>
      </SelectContent>
    </Select>
  )
}