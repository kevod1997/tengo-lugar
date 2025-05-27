import { VerificationStatus, CardType as PrismaCardType } from "@prisma/client"; // Asumo que usas los tipos de Prisma
// Si DocumentType viene de request/image-documents-validation.ts, asegúrate que la ruta es correcta.
// Si es un tipo global, puede que ya esté disponible.
import { DocumentType as AppDocumentType } from "./request/image-documents-validation"; // Renombrado para claridad

// Base para cualquier payload que sea específico de un usuario
export interface UserSpecificEventPayload {
  userId: string;
}

// Payload específico para actualizaciones de verificación de documentos
export interface DocumentVerificationUpdatePayload extends UserSpecificEventPayload {
  dataType: AppDocumentType; // 'IDENTITY', 'LICENCE', 'INSURANCE', 'CARD'
  documentId: string;     // ID del documento específico (IdentityCard.id, Licence.id, etc.)
  status: VerificationStatus; // Estado de Prisma
  failureReason?: string | null;
  // Campos para que el cliente actualice el estado de 'has...Key' y potencialmente URLs de imagen
  frontFileKey?: string | null;
  backFileKey?: string | null;
  // Para INSURANCE o CARD, necesitamos identificar el coche
  carId?: string;
  // Para CARD (VehicleCard), necesitamos el ID de la tarjeta específica
  cardId?: string; // (Coincide con VehicleCard.id en tu modelo)
  // Si el documento es de tipo 'CARD', podríamos querer enviar el cardType también.
  cardType?: PrismaCardType; // (GREEN, BLUE)
}

// Payload para actualizaciones de imagen de perfil
export interface ProfileImageUpdatePayload extends UserSpecificEventPayload {
  dataType: 'PROFILE_IMAGE'; // Un literal type para distinguir
  profileImageKey: string | null; // La nueva clave de la imagen o null si se eliminó
}

// Payload para notificaciones genéricas o para forzar re-fetch
export interface GenericUserUpdatePayload extends UserSpecificEventPayload {
  dataType: 'GENERIC_USER_DATA_UPDATE'; // Literal type
  message?: string; // Mensaje opcional para mostrar
  // Podrías añadir un 'area' o 'reason' si el cliente necesita re-fetchear una parte específica
  // por ejemplo, area: 'cars' para indicar que los datos de los coches podrían estar obsoletos.
  updatedArea?: 'CARS' | 'PROFILE_BASICS' | 'VERIFICATIONS';
}


// Un tipo unión para todos los posibles payloads que el cliente podría recibir
export type SseEventData =
  | DocumentVerificationUpdatePayload
  | ProfileImageUpdatePayload
  | GenericUserUpdatePayload;
  // Añade más tipos de payload aquí a medida que los necesites


// Estructura del mensaje que se publica en Redis
export interface RedisEventMessage {
  eventName: string; // ej: 'user_verification_update', 'profile_image_update', 'generic_user_update'
  payload: SseEventData; // El payload específico del evento
}