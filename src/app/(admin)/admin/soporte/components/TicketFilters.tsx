"use client"

import { useState, useTransition } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { TicketStatus, TicketCategory } from "@prisma/client"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: TicketStatus.OPEN, label: "Abierto" },
  { value: TicketStatus.RESOLVED, label: "Resuelto" }
]

const categoryOptions = [
  { value: "all", label: "Todas las categorías" },
  { value: TicketCategory.PAYMENT_ISSUE, label: "Problema de pago" },
  { value: TicketCategory.TRIP_ISSUE, label: "Problema de viaje" },
  { value: TicketCategory.ACCOUNT_ISSUE, label: "Problema de cuenta" },
  { value: TicketCategory.OTHER, label: "Otro" }
]

export function TicketFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const currentStatus = searchParams.get("status") || TicketStatus.OPEN
  const currentCategory = searchParams.get("category") || "all"
  const assignedToMe = searchParams.get("assignedToMe") === "true"

  const updateFilters = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === "all" || value === false || value === "") {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }

    // Reset to page 1 when filtering
    params.delete("page")

    startTransition(() => {
      router.push(`/admin/soporte?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters("search", search)
  }

  const clearFilters = () => {
    setSearch("")
    startTransition(() => {
      router.push("/admin/soporte")
    })
  }

  const hasActiveFilters = (currentStatus !== TicketStatus.OPEN && currentStatus !== "all") || currentCategory !== "all" || assignedToMe || search

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, asunto o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Buscar
        </Button>
        {hasActiveFilters && (
          <Button type="button" variant="outline" onClick={clearFilters} disabled={isPending}>
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </form>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={currentStatus}
            onValueChange={(value) => updateFilters("status", value)}
            disabled={isPending}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={currentCategory}
            onValueChange={(value) => updateFilters("category", value)}
            disabled={isPending}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="assignedToMe"
              checked={assignedToMe}
              onCheckedChange={(checked) => updateFilters("assignedToMe", checked === true)}
              disabled={isPending}
            />
            <Label htmlFor="assignedToMe" className="cursor-pointer">
              Solo mis tickets
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
