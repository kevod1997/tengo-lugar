import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationInfo } from '@/types/route-types'
import { Loader2 } from 'lucide-react'

interface LocationInputProps {
  label: string
  elementId: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  locationInfo: LocationInfo
  isLoading: boolean
}

const LocationInput = ({ 
  label, 
  elementId,
  value, 
  onChange,
  locationInfo,
  isLoading
}: LocationInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={elementId}>{label}</Label>
      <div className="relative">
        <Input
          id={elementId}
          value={value}
          onChange={onChange}
          placeholder={`Ingrese dirección de ${label.toLowerCase()}`}
          disabled={isLoading}
          required
          className={isLoading ? "pr-10" : ""}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {locationInfo.city && locationInfo.province && (
        <p className="text-xs text-muted-foreground">
          Ciudad: {locationInfo.city}, Provincia: {locationInfo.province}
        </p>
      )}
    </div>
  )
}

export default LocationInput