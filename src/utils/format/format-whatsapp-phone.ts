import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

/**
 * Formatea un número para WhatsApp, asegurando que esté en formato adecuado
 * incluyendo prefijos específicos de cada país
 * 
 * @param phoneNumber - Número de teléfono ingresado por el usuario
 * @param countryCode - Código de país ISO (AR, US, etc.)
 * @returns Número formateado para WhatsApp o null si es inválido
 */
export function formatNumberForWhatsApp(phoneNumber: string, countryCode: string = 'AR'): string | null {
    try {
        // Intentamos parsear el número con el código de país proporcionado
        const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode as any);

        if (!parsedNumber || !parsedNumber.isValid()) {
            return null;
        }

        // Obtenemos el formato E.164 básico
        let formattedNumber = parsedNumber.format('E.164');

        // Caso especial para Argentina: aseguramos que tenga el 9
        if (countryCode === 'AR' && !formattedNumber.startsWith('+549')) {
            if (formattedNumber.startsWith('+54')) {
                formattedNumber = '+549' + formattedNumber.substring(3);
            }
        }

        return formattedNumber;
    } catch (error) {
        console.error('Error formatting number for WhatsApp:', error);
        return null;
    }
}