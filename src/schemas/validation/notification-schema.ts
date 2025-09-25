import { z } from "zod"

// Create a Zod enum for eventType validation
const eventTypeValues = [
  // Document Verification Events
  'identity_card_verified',
  'identity_card_rejected',
  'license_verified',
  'license_rejected',
  
  // Vehicle Insurance Events
  'car_insurance_verified',
  'car_insurance_rejected',
  
  // Vehicle Card Events
  'vehicle_card_verified',
  'vehicle_card_rejected',
  
  // Phone Verification Events
  'phone_verified',
  'phone_verification_failed',
  
  // Profile Update Events
  'profile_updated',
  'profile_image_updated',
  
  // Car Management Events
  'car_added',
  'car_removed',
  'car_updated',
  
  // Terms and Conditions Events
  'terms_accepted',
  
  // Trip Notification Events
  'trip_status_changed',
  'trip_created',
  'trip_cancelled',
  
  // System Notification Events
  'system_maintenance',
  'new_feature',
  'system_announcement',
  
  // General Notification Events
  'notification_created'
] as const

const eventTypeSchema = z.enum(eventTypeValues)

export const sendTargetedNotificationSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200, 'Título muy largo'),
  message: z.string().min(1, 'Mensaje requerido'),
  eventType: eventTypeSchema.optional(), // Optional eventType for user store updates
  link: z.string().optional().or(z.literal('')),
  additionalData: z.any().optional(),
  // Targeting options (only one should be provided)
  targetUserId: z.string().optional(),
  targetUserIds: z.array(z.string()).optional(),
  broadcast: z.boolean().optional(),
  targetRole: z.enum(['driver', 'passenger', 'admin']).optional(),
}).refine((data) => {
  // Ensure only one targeting option is provided
  const targetingOptions = [data.targetUserId, data.targetUserIds, data.broadcast, data.targetRole]
  const providedOptions = targetingOptions.filter(option => option !== undefined && option !== false)
  return providedOptions.length === 1
}, {
  message: "Debe proporcionar exactamente una opción de targeting: targetUserId, targetUserIds, broadcast, o targetRole"
})

export const notificationRoleSchema = z.enum(['driver', 'passenger', 'admin'])

export const basicNotificationSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200, 'Título muy largo'),
  message: z.string().min(1, 'Mensaje requerido'),
  eventType: eventTypeSchema.optional(),
  link: z.string().optional().or(z.literal('')),
  additionalData: z.any().optional()
})

export type SendTargetedNotificationSchema = z.infer<typeof sendTargetedNotificationSchema>
export type NotificationRoleSchema = z.infer<typeof notificationRoleSchema>
export type BasicNotificationSchema = z.infer<typeof basicNotificationSchema>