import { useState } from "react"


import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { FuelType } from "@prisma/client"


interface VehicleFuelFormProps {
    fuelType: FuelType | null
    averageFuelConsume: number | null
    onSubmit: (data: { fuelType: FuelType; averageFuelConsume: number }) => Promise<void>
  }
  
  export function VehicleFuelForm({ fuelType, averageFuelConsume, onSubmit }: VehicleFuelFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
      fuelType: fuelType || undefined,
      averageFuelConsume: averageFuelConsume || undefined
    })
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (formData.fuelType && formData.averageFuelConsume) {
        try {
          setIsSubmitting(true)
          await onSubmit({
            fuelType: formData.fuelType,
            averageFuelConsume: formData.averageFuelConsume
          })
          setIsEditing(false)
        } finally {
          setIsSubmitting(false)
        }
      }
    }  

  if (!isEditing) {
    return (
      <div className="mt-4 space-y-2">
        <div>
          <h4 className="font-semibold">Tipo de Combustible</h4>
          <p>{fuelType || "No especificado"}</p>
        </div>
        <div>
          <h4 className="font-semibold">Consumo Promedio</h4>
          <p>{averageFuelConsume ? `${averageFuelConsume} L/100km` : "No especificado"}</p>
        </div>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Editar información
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fuelType">Tipo de Combustible</Label>
        <Select
          value={formData.fuelType}
          onValueChange={(value: FuelType) => 
            setFormData(prev => ({ ...prev, fuelType: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NAFTA">Nafta</SelectItem>
            <SelectItem value="DIESEL">Diesel</SelectItem>
            <SelectItem value="GNC">GNC</SelectItem>
            <SelectItem value="ELECTRICO">Eléctrico</SelectItem>
            <SelectItem value="HIBRIDO">Híbrido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="averageFuelConsume">Consumo Promedio (L/100km)</Label>
        <Input
          id="averageFuelConsume"
          type="number"
          step="0.1"
          value={formData.averageFuelConsume || ""}
          onChange={(e) => 
            setFormData(prev => ({ 
              ...prev, 
              averageFuelConsume: parseFloat(e.target.value) 
            }))
          }
          placeholder="Ej: 7.5"
        />
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsEditing(false)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}