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

export interface ChatMessage {
  id?: string;
  content: string;
  type: 'system' | 'message' | 'error';
  user_id?: string;
  user_name?: string;
  isSender: boolean;
  timestamp: string;
  rawTimestamp?: string;
  isLocal?: boolean;
  isPending?: boolean; 
}

export interface ChatRoom {
  id: string;
  tripId: string;
  status: 'active' | 'archived';
  createdAt: string;
  members: ChatMember[];
}

export interface ChatMember {
  id: string;
  userId: string;
  role: 'driver' | 'passenger';
  isActive: boolean;
  joinedAt: string;
}