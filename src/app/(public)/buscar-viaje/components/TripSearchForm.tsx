'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, ArrowLeftRight, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { disabledDays, maxDate, today } from '@/utils/helpers/time/calendar-preferences'
import { LoadingButton } from '@/components/ui/loading-button'
import { useAsyncLoading } from '@/hooks/ui/useAsyncLoading'
import { toast } from 'sonner'

interface TripSearchFormProps {
    initialValues?: {
        origin?: string
        destination?: string
        date?: string
        passengers?: string
    }
    className?: string
}

export default function TripSearchForm({ initialValues = {}, className }: TripSearchFormProps) {
    const router = useRouter()
    const { executeWithLoading } = useAsyncLoading()
    const [formData, setFormData] = useState({
        origin: initialValues.origin || '',
        destination: initialValues.destination || '',
        date: initialValues.date ? new Date(initialValues.date) : undefined,
        passengers: initialValues.passengers || '1'
    })

    const [calendarOpen, setCalendarOpen] = useState(false)

    // Check if the form is valid (origin, destination, and date are all provided)
    const isFormValid = Boolean(
        formData.origin.trim() &&
        formData.destination.trim() &&
        formData.date
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Additional validation check before submitting
        if (!isFormValid) {
            const missingFields = [];
            if (!formData.origin.trim()) missingFields.push('origen');
            if (!formData.destination.trim()) missingFields.push('destino');
            if (!formData.date) missingFields.push('fecha');

            toast.error('Campos requeridos faltantes', {
                description: `Por favor completa los siguientes campos: ${missingFields.join(', ')}`
            });
            return;
        }

        // Build the URL parameters
        const params = new URLSearchParams()
        if (formData.origin) params.set('originCity', formData.origin)
        if (formData.destination) params.set('destinationCity', formData.destination)
        if (formData.date) params.set('date', format(formData.date, 'yyyy-MM-dd'))
        if (formData.passengers) params.set('passengers', formData.passengers)
        params.set('page', '1')
        params.set('pageSize', '10')

        // The URL that will trigger the server action
        const searchUrl = `/buscar-viaje?${params.toString()}`

        await executeWithLoading(
            'searchingTrips',
            async () => {
                router.push(searchUrl)
                // Add a slight delay to show loading state
                await new Promise(resolve => setTimeout(resolve, 300))
            },
            { showToastOnError: false }
        )
    }

    const switchLocations = () => {
        setFormData(prev => ({
            ...prev,
            origin: prev.destination,
            destination: prev.origin
        }))
    }

    return (
        <Card className={cn("shadow-lg", className)}>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Origin and Destination section with switch button */}
                        <div className="relative flex flex-col md:flex-row md:items-center md:col-span-2 gap-2">
                            {/* Origin Input */}
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Origen"
                                    value={formData.origin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                                    className={cn(
                                        "h-12 pl-10 pr-4",
                                       
                                    )}
                                    // className={cn(
                                    //     "h-12 pl-10 pr-4",
                                    //     !formData.origin.trim() && "border-amber-400"
                                    // )}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>

                            {/* Switch button */}
                            <div className="relative flex justify-center -my-4
                             md:my-0 md:-mx-4 z-10">
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 rounded-full bg-background shadow-sm"
                                    onClick={switchLocations}
                                >
                                    <ArrowLeftRight className="h-4 w-4" />
                                    <span className="sr-only">Intercambiar origen y destino</span>
                                </Button>
                            </div>

                            {/* Destination Input */}
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Destino"
                                    value={formData.destination}
                                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                                    className={cn(
                                        "h-12 pl-10 pr-4",
                                      
                                    )}
                                    // className={cn(
                                    //     "h-12 pl-10 pr-4",
                                    //     !formData.destination.trim() && "border-amber-400"
                                    // )}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-12 px-3 text-left font-normal justify-start",
                                        
                                        )}
                                        // className={cn(
                                        //     "w-full h-12 px-3 text-left font-normal justify-start",
                                        //     !formData.date && "border-amber-400"
                                        // )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.date ? (
                                            format(formData.date, "PPP", { locale: es })
                                        ) : (
                                            <span>Seleccionar fecha *</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        disabled={disabledDays}
                                        selected={formData.date}
                                        onSelect={(date) => {
                                            setFormData(prev => ({ ...prev, date }))
                                            setCalendarOpen(false)
                                        }}
                                        autoFocus
                                        locale={es}
                                        defaultMonth={today}
                                        startMonth={today}
                                        endMonth={maxDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Passenger Count + Search Button */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                                <Select
                                    value={formData.passengers}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, passengers: value }))}
                                >
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Pasajeros" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4].map(num => (
                                            <SelectItem key={num} value={num.toString()}>
                                                {num} {num === 1 ? 'pasajero' : 'pasajeros'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2">
                                <LoadingButton
                                    operation="searchingTrips"
                                    type="submit"
                                    className="w-full h-12"
                                    disabled={!isFormValid}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}