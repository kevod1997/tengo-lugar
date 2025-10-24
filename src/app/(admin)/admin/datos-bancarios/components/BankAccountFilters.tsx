'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

export function BankAccountFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isVerified, setIsVerified] = useState(searchParams.get('isVerified') || 'ALL')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const updateFilters = (newStatus?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    const finalStatus = newStatus !== undefined ? newStatus : isVerified
    const finalSearch = newSearch !== undefined ? newSearch : searchTerm

    if (finalStatus && finalStatus !== 'ALL') {
      params.set('isVerified', finalStatus)
    } else {
      params.delete('isVerified')
    }

    if (finalSearch) {
      params.set('search', finalSearch)
    } else {
      params.delete('search')
    }

    // Reset to page 1 when filters change
    params.set('page', '1')

    router.push(`/admin/datos-bancarios?${params.toString()}`)
  }

  const handleStatusChange = (newStatus: string) => {
    setIsVerified(newStatus)
    updateFilters(newStatus, undefined)
  }

  const handleSearch = () => {
    updateFilters(undefined, searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    updateFilters(undefined, '')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nombre, email o alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      <div className="w-full sm:w-[200px]">
        <Select value={isVerified} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="false">Pendiente</SelectItem>
            <SelectItem value="true">Verificado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
