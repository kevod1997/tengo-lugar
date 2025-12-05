'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTripPreferencesStore } from '@/store/trip-preferences-store'

const TripPreferencesForm = () => {
  const preferences = useTripPreferencesStore()
  
  // Validate seats input (1-4 range)
  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let value: number = parseInt(e.target.value)
    if (isNaN(value)) value = 1
    if (value < 1) value = 1
    if (value > 4) value = 4
    preferences.setAvailableSeats(value)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Preferencias de viaje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available seats selector */}
        <div className="space-y-2">
          <Label htmlFor="available-seats">Asientos disponibles (1-4)</Label>
          <div className="flex space-x-2 items-center">
            <Input
              id="available-seats"
              type="number"
              min={1}
              max={4}
              value={preferences.availableSeats}
              onChange={handleSeatsChange}
              className="w-20"
            />
            <Select 
              value={preferences.availableSeats.toString()} 
              onValueChange={(value) => preferences.setAvailableSeats(parseInt(value))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecciona asientos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 asiento</SelectItem>
                <SelectItem value="2">2 asientos</SelectItem>
                <SelectItem value="3">3 asientos</SelectItem>
                <SelectItem value="4">4 asientos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            La cantidad de asientos disponibles para pasajeros.
          </p>
        </div>
        
        {/* Luggage allowance */}
        <div className="space-y-2">
          <Label htmlFor="luggage-allowance">Equipaje permitido</Label>
          <Select 
            value={preferences.luggageAllowance} 
            onValueChange={preferences.setLuggageAllowance}
          >
            <SelectTrigger id="luggage-allowance">
              <SelectValue placeholder="Selecciona tamaño de equipaje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMALL">Pequeño (mochila o bolso)</SelectItem>
              <SelectItem value="MEDIUM">Mediano (maleta de mano)</SelectItem>
              <SelectItem value="LARGE">Grande (maleta de bodega)</SelectItem>
              <SelectItem value="EXTRA">Extra (deportes, instrumentos)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Boolean preferences */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="allow-pets" className="flex-1">Permitir mascotas</Label>
            <Switch 
              id="allow-pets" 
              checked={preferences.allowPets} 
              onCheckedChange={preferences.togglePets}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="allow-children" className="flex-1">Permitir niños</Label>
            <Switch 
              id="allow-children" 
              checked={preferences.allowChildren} 
              onCheckedChange={preferences.toggleChildren}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="smoking-allowed" className="flex-1">Permitir fumar</Label>
            <Switch 
              id="smoking-allowed" 
              checked={preferences.smokingAllowed} 
              onCheckedChange={preferences.toggleSmoking}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-approve" className="flex-1">Aprobar reservas automáticamente</Label>
            <Switch 
              id="auto-approve" 
              checked={preferences.autoApproveReservations} 
              onCheckedChange={preferences.toggleAutoApprove}
            />
          </div>
        </div>
        
        {/* Additional notes */}
        <div className="space-y-2">
          <Label htmlFor="additional-notes">Notas adicionales</Label>
          <Textarea 
            id="additional-notes" 
            placeholder="Puedes agregar reglas o información adicional para tus pasajeros..."
            value={preferences.additionalNotes}
            onChange={(e) => preferences.setAdditionalNotes(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {preferences.additionalNotes.length}/500
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default TripPreferencesForm