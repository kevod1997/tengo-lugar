import { forwardRef } from 'react'

import { Loader2 } from 'lucide-react'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PlateInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error: string | null
  isValidating: boolean
  className?: string
}

export const PlateInput = forwardRef<HTMLInputElement, PlateInputProps>(
  function PlateInput({ value, onChange, error, isValidating, className = '' }, ref) {
    return (
      <div className="space-y-2">
        <Label htmlFor="plate">Patente</Label>
        <div className="relative">
          <Input
            id="plate"
            ref={ref}
            value={value}
            onChange={onChange}
            placeholder="Ingresa la patente"
            className={`uppercase ${error ? 'border-destructive' : ''} ${className}`}
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }
)