'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface TripPreferencesFormProps {
  onPreferencesChange?: (preferences: {
    availableSeats: number;
    luggageAllowance: string;
    allowPets: boolean;
    allowChildren: boolean;
    smokingAllowed: boolean;
    autoApproveReservations: boolean;
    additionalNotes: string;
  }) => void;
}

const TripPreferencesForm: React.FC<TripPreferencesFormProps> = ({ onPreferencesChange }) => {
  const [preferences, setPreferences] = useState({
    availableSeats: 4, // Add this property
    luggageAllowance: 'MEDIUM',
    allowPets: false,
    allowChildren: true,
    smokingAllowed: false,
    autoApproveReservations: false,
    additionalNotes: '',
});

interface Preferences {
    availableSeats: number;
    luggageAllowance: string;
    allowPets: boolean;
    allowChildren: boolean;
    smokingAllowed: boolean;
    autoApproveReservations: boolean;
    additionalNotes: string;
}

type PreferenceKey = keyof Preferences;

const handleChange = (key: PreferenceKey, value: Preferences[PreferenceKey]) => {
    const updatedPreferences: Preferences = {
        ...preferences,
        [key]: value
    };
    setPreferences(updatedPreferences);
    if (onPreferencesChange) {
        onPreferencesChange(updatedPreferences);
    }
};

  // Validate seats input (1-4 range)
const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let value: number = parseInt(e.target.value)
    if (isNaN(value)) value = 1
    if (value < 1) value = 1
    if (value > 4) value = 4
    handleChange('availableSeats', value)
}

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Preferencias de viaje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add available seats selector */}
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
              onValueChange={(value) => handleChange('availableSeats', parseInt(value))}
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
        
        <div className="space-y-2">
          <Label htmlFor="luggage-allowance">Equipaje permitido</Label>
          <Select 
            value={preferences.luggageAllowance} 
            onValueChange={(value) => handleChange('luggageAllowance', value)}
          >
            <SelectTrigger id="luggage-allowance">
              <SelectValue placeholder="Selecciona tamaño de equipaje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMALL">Pequeño (mochila o bolso)</SelectItem>
              <SelectItem value="MEDIUM">Mediano (maleta de mano)</SelectItem>
              <SelectItem value="LARGE">Grande (maleta de bodega)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="allow-pets" className="flex-1">Permitir mascotas</Label>
            <Switch 
              id="allow-pets" 
              checked={preferences.allowPets} 
              onCheckedChange={(checked) => handleChange('allowPets', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="allow-children" className="flex-1">Permitir niños</Label>
            <Switch 
              id="allow-children" 
              checked={preferences.allowChildren} 
              onCheckedChange={(checked) => handleChange('allowChildren', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="smoking-allowed" className="flex-1">Permitir fumar</Label>
            <Switch 
              id="smoking-allowed" 
              checked={preferences.smokingAllowed} 
              onCheckedChange={(checked) => handleChange('smokingAllowed', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-approve" className="flex-1">Aprobar reservas automáticamente</Label>
            <Switch 
              id="auto-approve" 
              checked={preferences.autoApproveReservations} 
              onCheckedChange={(checked) => handleChange('autoApproveReservations', checked)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="additional-notes">Notas adicionales</Label>
          <Textarea 
            id="additional-notes" 
            placeholder="Puedes agregar reglas o información adicional para tus pasajeros..."
            value={preferences.additionalNotes}
            onChange={(e) => handleChange('additionalNotes', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default TripPreferencesForm