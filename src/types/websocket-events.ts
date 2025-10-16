/**
 * WebSocket Event Types for User State Updates
 */
export type eventType =
  // Document Verification Events
  | 'identity_card_verified'
  | 'identity_card_rejected'
  | 'license_verified'
  | 'license_rejected'
  
  // Vehicle Insurance Events
  | 'car_insurance_verified'
  | 'car_insurance_rejected'
  
  // Vehicle Card Events
  | 'vehicle_card_verified'
  | 'vehicle_card_rejected'
  
  // Phone Verification Events
  | 'phone_verified'
  | 'phone_verification_failed'
  
  // Profile Update Events
  | 'profile_updated'
  | 'profile_image_updated'
  
  // Car Management Events
  | 'car_added'
  | 'car_removed'
  | 'car_updated'
  
  // Terms and Conditions Events
  | 'terms_accepted'
  
  // Trip Notification Events
  | 'trip_status_changed'
  | 'trip_created'
  | 'trip_cancelled'

  // Payment Events
  | 'payment_approved'
  | 'payment_rejected'
  | 'payment_completed'

  // System Notification Events
  | 'system_maintenance'
  | 'new_feature'
  | 'system_announcement'

  // General Notification Events
  | 'notification_created'

