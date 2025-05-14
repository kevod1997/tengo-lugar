// src/utils/helpers/calculate-age.ts

/**
 * Calcula la edad en años a partir de una fecha de nacimiento
 * @param birthDate - Fecha de nacimiento (string o Date)
 * @returns La edad en años, o undefined si la fecha no es válida
 */
export function calculateAge(birthDate: string | Date | null | undefined): number | undefined {
    if (!birthDate) return undefined;
    
    try {
      const birth = new Date(birthDate);
      
      // Verificar si la fecha es válida
      if (isNaN(birth.getTime())) return undefined;
      
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      
      // Ajustar si todavía no ha llegado el cumpleaños este año
      if (
        today.getMonth() < birth.getMonth() || 
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ) {
        age--;
      }
      
      // Solo retornar edad si es un valor razonable
      return age >= 0 && age < 120 ? age : undefined;
    } catch (error) {
      console.error("Error calculando la edad:", error);
      return undefined;
    }
  }