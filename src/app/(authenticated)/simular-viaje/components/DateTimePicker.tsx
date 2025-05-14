import { Control, Controller, FieldErrors } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Clock } from 'lucide-react'
import { addDays, addHours, format, isBefore, isToday, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { generateTimeOptions } from '@/utils/helpers/time/generate-time-options'

interface DateTimePickerProps {
  control: Control<any>
  errors: FieldErrors
}

const DateTimePicker = ({ control, errors }: DateTimePickerProps) => {
  // Setup date constraints
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const maxDate = addDays(today, 15)
  maxDate.setHours(23, 59, 59, 999)
  
  const disabledDays = {
    after: maxDate,
    before: today
  }
  
  // Get available time options based on selected date
  const getAvailableTimeOptions = (selectedDate?: Date) => {
    const now = new Date()
    const baseOptions = generateTimeOptions()
    
    if (selectedDate && isToday(selectedDate)) {
      const fourHoursFromNow = addHours(now, 4)
      return baseOptions.filter((option) => {
        const optionTime = parse(option.value, 'HH:mm', new Date())
        optionTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
        return isBefore(fourHoursFromNow, optionTime)
      })
    }
    
    return baseOptions
  }
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Date Picker */}
      <div className="space-y-2">
        <Label>Fecha del viaje</Label>
        <Controller
          name="tripDate"
          control={control}
          rules={{ required: "La fecha es requerida" }}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !field.value && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  disabled={disabledDays}
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  locale={es}
                  defaultMonth={today}
                  startMonth={today}
                  endMonth={maxDate}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.tripDate && (
          <p className="text-xs text-red-500">{errors.tripDate.message as string}</p>
        )}
      </div>

      {/* Time Picker */}
      <div className="space-y-2">
        <Label>Hora de salida</Label>
        <Controller
          name="departureTime"
          control={control}
          rules={{ required: "La hora es requerida" }}
          render={({ field }) => {
            const timeOptions = getAvailableTimeOptions(control._formValues.tripDate);
            
            return (
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    timeOptions.length > 0
                      ? 'Seleccionar hora'
                      : 'No hay horas disponibles'
                  }>
                    {field.value ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 inline" />
                        {field.value}
                      </>
                    ) : "Seleccionar hora"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.departureTime && (
          <p className="text-xs text-red-500">{errors.departureTime.message as string}</p>
        )}
      </div>
    </div>
  )
}

export default DateTimePicker