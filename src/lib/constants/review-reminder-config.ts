/**
 * Configuration constants for the review reminder system
 *
 * These constants control the timing and behavior of review reminders
 * sent to users after trip completion
 */

export const REVIEW_REMINDER_CONFIG = {
  /**
   * Time to wait after trip completion before sending first reminder
   * 24 hours gives users time to rest before being prompted
   */
  REMINDER_DELAY_HOURS: 24,

  /**
   * Days after trip completion to send second reminder
   * Only sent if user hasn't submitted review yet
   */
  SECOND_REMINDER_DAYS: 3,

  /**
   * Total window for submitting reviews (in days)
   * After this period, users can no longer submit reviews
   */
  REVIEW_WINDOW_DAYS: 10,

  /**
   * Base URL for review submission
   * Will be combined with tripId to create review links
   */
  getReviewUrl: (tripId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';
    return `${baseUrl}/trips/${tripId}?openReview=true`;
  },

  /**
   * Base URL for viewing user profile
   */
  getProfileUrl: (userId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';
    return `${baseUrl}/profile/${userId}`;
  }
} as const;
