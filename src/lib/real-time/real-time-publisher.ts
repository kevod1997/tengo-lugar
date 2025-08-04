// src/lib/real-time/real-time-publisher.ts

import { redisService } from "@/lib/redis/redis-service";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { NotificationType, VerificationStatus } from "@prisma/client";
import { 
  RedisRealtimeMessage, 
  StateUpdate, 
  NotificationChannel, 
  RealtimePublishOptions,
  UserVerificationStateUpdate 
} from "@/types/real-time-types";
import { TipoAccionUsuario } from "@/types/actions-logs";

/**
 * Publishes real-time events to Redis for WebSocket server consumption
 * This function is designed to be non-blocking and fail-safe
 */
export class RealtimePublisher {
  // Remove single channel approach - use queue-based system compatible with WebSocket server
  
  /**
   * Publishes a real-time message to Redis
   * Failures in this function should NOT affect the calling server action
   */
  static async publishRealtimeEvent(
    notificationType: NotificationType,
    stateUpdate: StateUpdate,
    options: RealtimePublishOptions = {}
  ): Promise<void> {
    // Fire-and-forget pattern - don't await to avoid blocking server actions
    this.publishAsync(notificationType, stateUpdate, options)
      .catch(error => {
        // Silent error logging - don't let Redis failures impact main functionality
        console.warn('Real-time publishing failed (non-critical):', error);
      });
  }

  /**
   * Internal async publishing method
   * Updated to use queue-based system compatible with WebSocket server polling
   */
  private static async publishAsync(
    notificationType: NotificationType,
    stateUpdate: StateUpdate,
    options: RealtimePublishOptions
  ): Promise<void> {
    try {
      // Check if Redis REST client is available (for queue operations)
      if (!redisService.isRestClientAvailable()) {
        console.warn('Redis REST client not available - skipping real-time publishing');
        return;
      }

      // Build channels based on options and state update
      const channels = this.buildChannels(stateUpdate, options);
      
      // Create Redis message
      const message: RedisRealtimeMessage = {
        userId: options.userId || this.extractUserId(stateUpdate),
        tripId: options.tripId || this.extractTripId(stateUpdate),
        channels,
        stateUpdate,
        notificationType,
        priority: options.priority || this.determinePriority(notificationType),
        createdAt: new Date()
      };

      const messageString = JSON.stringify(message);

      // Publish to each channel's queue using list operations (compatible with WebSocket server rpop)
      let publishedCount = 0;
      const restClient = redisService.getRestClient(false);
      
      if (!restClient) {
        console.warn('Redis REST client not available for list operations');
        return;
      }

      for (const channel of channels) {
        try {
          const queueKey = `queue:${channel}`;
          // Use lpush to add message to the left of the list (WebSocket server uses rpop from right)
          await restClient.lpush(queueKey, messageString);
          // Set TTL on the list
          await restClient.expire(queueKey, 300); // 5 min TTL
          
          publishedCount++;
        } catch (channelError) {
          console.warn(`Failed to publish to channel ${channel}:`, channelError);
        }
      }

      if (publishedCount > 0) {
        // Optional: Log successful publishing (low priority)
        await this.logPublishingSuccess(notificationType, message);
      } else {
        console.warn(`Failed to publish real-time event to any channel: ${notificationType}`);
      }

    } catch (error) {
      // Log error but don't throw - this should never impact server actions
      await this.logPublishingError(notificationType, error);
    }
  }

  /**
   * Build channels for message routing
   */
  private static buildChannels(
    stateUpdate: StateUpdate, 
    options: RealtimePublishOptions
  ): NotificationChannel[] {
    if (options.channels) {
      return options.channels;
    }

    const channels: NotificationChannel[] = [];

    // Add user-specific channel
    const userId = this.extractUserId(stateUpdate);
    if (userId) {
      channels.push(`user-updates:${userId}` as NotificationChannel);
    }

    // Add trip-specific channel if applicable
    const tripId = this.extractTripId(stateUpdate);
    if (tripId) {
      channels.push(`trip-updates:${tripId}` as NotificationChannel);
      
      // For trip updates, also notify all affected users
      if (stateUpdate.type === 'trip_status_update') {
        stateUpdate.affectedUserIds.forEach(affectedUserId => {
          channels.push(`user-updates:${affectedUserId}` as NotificationChannel);
        });
      }
    }

    return channels;
  }

  /**
   * Extract user ID from state update
   */
  private static extractUserId(stateUpdate: StateUpdate): string | undefined {
    switch (stateUpdate.type) {
      case 'user_verification_update':
        return stateUpdate.userId;
      case 'reservation_update':
        return stateUpdate.passengerId; // Could also be driverId depending on context
      case 'payment_status_update':
        return stateUpdate.userId;
      default:
        return undefined;
    }
  }

  /**
   * Extract trip ID from state update
   */
  private static extractTripId(stateUpdate: StateUpdate): string | undefined {
    switch (stateUpdate.type) {
      case 'trip_status_update':
        return stateUpdate.tripId;
      case 'reservation_update':
        return stateUpdate.tripId;
      case 'payment_status_update':
        return stateUpdate.tripId;
      default:
        return undefined;
    }
  }

  /**
   * Determine message priority based on notification type
   */
  private static determinePriority(notificationType: NotificationType): 'low' | 'medium' | 'high' {
    const highPriorityTypes: NotificationType[] = [
      NotificationType.VERIFICATION_APPROVED,
      NotificationType.VERIFICATION_FAILED,
      NotificationType.TRIP_CANCELLED,
      NotificationType.PAYMENT_COMPLETED,
      NotificationType.PAYMENT_FAILED
    ];

    const mediumPriorityTypes: NotificationType[] = [
      NotificationType.LICENSE_VERIFIED,
      NotificationType.LICENSE_FAILED,
      NotificationType.RESERVATION_APPROVED,
      NotificationType.RESERVATION_REJECTED
    ];

    if (highPriorityTypes.includes(notificationType)) {
      return 'high';
    } else if (mediumPriorityTypes.includes(notificationType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Log successful publishing (non-blocking)
   */
  private static async logPublishingSuccess(
    notificationType: NotificationType,
    message: RedisRealtimeMessage
  ): Promise<void> {
    try {
      await logActionWithErrorHandling(
        {
          userId: message.userId || 'system',
          action: TipoAccionUsuario.NOTIFICACION_TIEMPO_REAL,
          status: 'SUCCESS',
          details: {
            notificationType,
            channels: message.channels,
            priority: message.priority
          }
        },
        {
          fileName: 'real-time-publisher.ts',
          functionName: 'publishAsync'
        }
      );
    } catch (error) {
      // Even logging errors shouldn't impact the main flow
      console.warn('Failed to log real-time publishing success:', error);
    }
  }

  /**
   * Log publishing errors (non-blocking)
   */
  private static async logPublishingError(
    notificationType: NotificationType,
    error: any
  ): Promise<void> {
    try {
      await logActionWithErrorHandling(
        {
          userId: 'system',
          action: TipoAccionUsuario.NOTIFICACION_TIEMPO_REAL,
          status: 'FAILED',
          details: {
            notificationType,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        {
          fileName: 'real-time-publisher.ts',
          functionName: 'publishAsync'
        }
      );
    } catch (logError) {
      // Final fallback - just console log
      console.error('Critical: Failed to log real-time publishing error:', logError);
    }
  }
}

/**
 * Helper functions for specific event types
 */
export class RealtimeEventHelpers {
  
  /**
   * Publish document verification update
   */
  static async publishDocumentVerification(
    userId: string,
    documentType: 'IDENTITY' | 'LICENCE' | 'INSURANCE' | 'CARD',
    status: VerificationStatus,
    failureReason?: string
  ): Promise<void> {
    const verificationFieldMap = {
      'IDENTITY': 'identityStatus' as const,
      'LICENCE': 'licenseStatus' as const,
      'INSURANCE': 'insuranceStatus' as const,
      'CARD': 'vehicleCardStatus' as const
    };

    const notificationTypeMap = {
      'IDENTITY': status === 'VERIFIED' ? NotificationType.VERIFICATION_APPROVED : NotificationType.VERIFICATION_FAILED,
      'LICENCE': status === 'VERIFIED' ? NotificationType.LICENSE_VERIFIED : NotificationType.LICENSE_FAILED,
      'INSURANCE': status === 'VERIFIED' ? NotificationType.INSURANCE_VERIFIED : NotificationType.INSURANCE_FAILED,
      'CARD': status === 'VERIFIED' ? NotificationType.VEHICLE_CARD_VERIFIED : NotificationType.VEHICLE_CARD_FAILED
    };

    const stateUpdate: UserVerificationStateUpdate = {
      type: 'user_verification_update',
      userId,
      verificationField: verificationFieldMap[documentType],
      status,
      failureReason,
      partialUserUpdate: {
        [verificationFieldMap[documentType]]: status,
        ...(documentType === 'IDENTITY' && { identityFailureReason: failureReason || null }),
        ...(documentType === 'LICENCE' && { licenseFailureReason: failureReason || null })
      }
    };

    await RealtimePublisher.publishRealtimeEvent(
      notificationTypeMap[documentType],
      stateUpdate,
      { 
        userId,
        priority: status === 'VERIFIED' ? 'high' : 'high' // Both success and failure are high priority
      }
    );
  }

  /**
   * Future helpers for other event types can be added here
   * publishTripUpdate, publishReservationUpdate, publishPaymentUpdate, etc.
   */
}