import { addDays, addHours, isBefore, isToday, parse } from "date-fns"
import { generateTimeOptions } from "./generate-time-options"

// Generar opciones de tiempo para el select
export const getAvailableTimeOptions = (tripDate: Date) => {
    const now = new Date()
    const baseOptions = generateTimeOptions()

    // Si la fecha seleccionada es hoy, filtra las horas que están al menos 4 horas después de la hora actual
    if (tripDate && isToday(tripDate)) {
        const fourHoursFromNow = addHours(now, 4)
        return baseOptions.filter(option => {
            const optionTime = parse(option.value, 'HH:mm', new Date())
            optionTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
            return isBefore(fourHoursFromNow, optionTime)
        })
    }

    // Si la fecha es futura, muestra todas las opciones
    return baseOptions
}

export const today = new Date();
today.setHours(0, 0, 0, 0); // Set to beginning of day

// Create a date 15 days from now
export const maxDate = addDays(today, 15);
maxDate.setHours(23, 59, 59, 999); // Set to end of day

// This will disable dates after 15 days from now
export const disabledDays = {
    after: maxDate, // Disable all dates after 15 days from now
    before: today   // Also disable all dates before today
};