'use server';

import { requireAuthentication } from "@/utils/helpers/auth-helper";

/**
 * Get current authenticated user ID for WebSocket authentication
 */
export async function getUserId(): Promise<string> {
  const session = await requireAuthentication('get-user-id.ts', 'getUserId');
  return session.user.id;
}