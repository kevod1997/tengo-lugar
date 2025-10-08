'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, CreditCard, UserCircle, HelpCircle } from "lucide-react"

type TicketCategory = 'PAYMENT_ISSUE' | 'TRIP_ISSUE' | 'ACCOUNT_ISSUE' | 'OTHER'

interface TicketCategorySelectProps {
  value: TicketCategory | undefined
  onValueChange: (value: TicketCategory) => void
  disabled?: boolean
}

const CATEGORIES = [
  {
    value: 'PAYMENT_ISSUE' as const,
    label: 'Problema de pago',
    description: 'Pagos, reembolsos, transferencias',
    icon: CreditCard,
  },
  {
    value: 'TRIP_ISSUE' as const,
    label: 'Problema con viaje',
    description: 'Reservas, cancelaciones, conductores',
    icon: FileText,
  },
  {
    value: 'ACCOUNT_ISSUE' as const,
    label: 'Problema de cuenta',
    description: 'Perfil, documentos, verificación',
    icon: UserCircle,
  },
  {
    value: 'OTHER' as const,
    label: 'Otro',
    description: 'Otras consultas o problemas',
    icon: HelpCircle,
  },
]

export function TicketCategorySelect({ value, onValueChange, disabled }: TicketCategorySelectProps) {
  const selectedCategory = CATEGORIES.find(cat => cat.value === value)
  const Icon = selectedCategory?.icon || HelpCircle

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona una categoría">
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span>{selectedCategory.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((category) => {
          const CategoryIcon = category.icon
          return (
            <SelectItem key={category.value} value={category.value}>
              <div className="flex items-start gap-3 py-1">
                <CategoryIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">{category.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
