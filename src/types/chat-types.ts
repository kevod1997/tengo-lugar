// src/types/api-types.ts (o donde definas JWTPayload si es necesario globalmente)
// Basado en tu auth.ts y lo que FastAPI espera:
export interface ChatApiJWTPayload {
  id: string;       // User ID
  name?: string;
  role?: string;     // Rol general de better-auth (admin, user, etc.)
  tripRole?: 'driver' | 'passenger' | null;
  roleId?: string | null; // driverCarId o TripPassenger.id
  // Claims estándar que better-auth podría añadir y FastAPI podría esperar (sub, aud, iss)
  sub?: string;
  aud?: string;
  iss?: string;
  // ...otros campos que tu definePayload en auth.ts pueda añadir.
}