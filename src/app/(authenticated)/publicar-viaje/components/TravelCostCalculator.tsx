'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import type { UserCar } from '@/types/user-types'

interface RouteInfo {
    routes: {
        distanceMeters: number;
        travelAdvisory?: {
            tollInfo?: {
                estimatedPrice?: { units: string }[];
            };
        };
    }[];
}

interface Fuel {
    id: string;
    fuelType: string;
    name: string;
    price: number;
}


interface TravelCostCalculatorProps {
    routeInfo: RouteInfo;
    fuels: Fuel[];
    cars: UserCar[];
    onPriceChange?: (calculatedPrice: {
        price: number;
        priceGuide: number;
    }) => void;
    onCarChange?: (carId: string) => void;
}

const TravelCostCalculator = ({ routeInfo, fuels, cars, onPriceChange, onCarChange }: TravelCostCalculatorProps) => {
    const [selectedCar, setSelectedCar] = useState('')
    const [selectedFuelType, setSelectedFuelType] = useState('')
    const [fuelCost, setFuelCost] = useState(0)
    const [totalCost, setTotalCost] = useState(0)
    const [costPerPassenger, setCostPerPassenger] = useState(0)
    const [fuelOptions, setFuelOptions] = useState<Fuel[]>([])
    const passengerCount = 4 // Default passenger count
    const [priceAdjustment, setPriceAdjustment] = useState(0) // 0 = default, -20 to +20 range
    const [adjustedCostPerPassenger, setAdjustedCostPerPassenger] = useState(0)

    useEffect(() => {
        if (adjustedCostPerPassenger > 0 && onPriceChange) {
            onPriceChange({ price: adjustedCostPerPassenger, priceGuide: costPerPassenger });
        }
    }, [adjustedCostPerPassenger, costPerPassenger, onPriceChange]);


    useEffect(() => {
        // Set default selected car if available
        if (cars && cars.length > 0) {
            setSelectedCar(cars[0].id)
        }
    }, [cars])

    useEffect(() => {
        // Update fuel options when car is selected
        if (selectedCar) {
            const car = cars?.find(car => car.id === selectedCar)
            if (car?.fuelType) {
                // Filter fuels based on the car's fuel type
                const filteredFuels = fuels.filter(fuel =>
                    fuel.fuelType === car.fuelType
                )
                setFuelOptions(filteredFuels)

                if (filteredFuels.length > 0) {
                    setSelectedFuelType(filteredFuels[0].id)
                }
            }
        }
    }, [selectedCar, fuels, cars])

    useEffect(() => {
        if (costPerPassenger > 0) {
            const adjustmentFactor = 1 + (priceAdjustment / 100)
            setAdjustedCostPerPassenger(costPerPassenger * adjustmentFactor)
        }
    }, [costPerPassenger, priceAdjustment])

    useEffect(() => {
        if (selectedCar && onCarChange) {
            onCarChange(selectedCar);
        }
    }, [selectedCar, onCarChange]);

    useEffect(() => {
        if (!routeInfo || !selectedCar || !selectedFuelType) return

        const car = cars?.find(car => car.id === selectedCar)
        const fuel = fuels.find(fuel => fuel.id === selectedFuelType)

        if (!car || !fuel) return

        // Calculate total distance in km
        const distanceKm = routeInfo.routes[0].distanceMeters / 1000

        // Calculate fuel consumption
        const fuelConsumptionLiters = car.averageFuelConsume
            ? distanceKm * (car.averageFuelConsume / 100)
            : 0

        // Calculate fuel cost
        const calculatedFuelCost = fuelConsumptionLiters * fuel.price
        setFuelCost(calculatedFuelCost)

        // Get toll cost if available
        let tollCost = 0
        if (routeInfo.routes[0].travelAdvisory?.tollInfo?.estimatedPrice) {
            tollCost = Number(routeInfo.routes[0].travelAdvisory.tollInfo.estimatedPrice[0].units || 0)
        }

        // Calculate total cost
        const calculatedTotalCost = calculatedFuelCost + tollCost
        setTotalCost(calculatedTotalCost)

        // Calculate cost per passenger
        setCostPerPassenger(calculatedTotalCost / passengerCount)
    }, [routeInfo, selectedCar, selectedFuelType, fuels, cars])


    if (!routeInfo || !routeInfo.routes || !cars?.length) {
        return null
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Costo estimado del viaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="car-select">Selecciona tu vehículo</Label>
                    <Select value={selectedCar} onValueChange={setSelectedCar}>
                        <SelectTrigger id="car-select">
                            <SelectValue placeholder="Selecciona un vehículo" />
                        </SelectTrigger>
                        <SelectContent>
                            {cars?.filter(car => car.isFullyEnabled).map(car => (
                                <SelectItem key={car.id} value={car.id}>
                                    {car.brand} {car.model} ({car.year}) - {car.plate}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedCar && fuelOptions.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="fuel-select">Tipo de combustible</Label>
                        <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                            <SelectTrigger id="fuel-select">
                                <SelectValue placeholder="Selecciona el combustible" />
                            </SelectTrigger>
                            <SelectContent>
                                {fuelOptions.map(fuel => (
                                    <SelectItem key={fuel.id} value={fuel.id}>
                                        {fuel.name} - ${fuel.price.toFixed(2)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {selectedCar && selectedFuelType && (
                    <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Costo de combustible</p>
                                <p className="text-lg font-medium">${fuelCost.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Costo total (incl. peajes)</p>
                                <p className="text-lg font-medium">${totalCost.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="bg-muted p-3 rounded-md mb-4">
                            <p className="text-sm text-muted-foreground">Precio sugerido (4 personas)</p>
                            <p className="text-xl font-bold">${costPerPassenger.toFixed(2)}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="price-adjustment">Ajuste de precio ({priceAdjustment}%)</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <span className="text-sm">-20%</span>
                                    <Slider
                                        id="price-adjustment"
                                        min={-20}
                                        max={20}
                                        step={1}
                                        value={[priceAdjustment]}
                                        onValueChange={(values) => setPriceAdjustment(values[0])}
                                        className="flex-1"
                                    />
                                    <span className="text-sm">+20%</span>
                                </div>
                            </div>

                            <div className="bg-primary/10 p-4 rounded-md border border-primary/20">
                                <p className="text-sm font-medium">Precio por pasajero</p>
                                <p className="text-2xl font-bold text-primary">${adjustedCostPerPassenger.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Este es el precio que puedes establecer para tu viaje.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default TravelCostCalculator