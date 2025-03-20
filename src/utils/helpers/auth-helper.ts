import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ServerActionError } from "@/lib/exceptions/server-action-error";

// Define roles as a constant for better type safety
export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

// Create a union type from the values
export type UserRole = typeof UserRoles[keyof typeof UserRoles];

/**
 * Checks if the current request is authenticated (has a valid session)
 * @param fileName The file name where this helper is called (for error reporting)
 * @param functionName The function name where this helper is called (for error reporting)
 * @returns The session object if authenticated
 * @throws ServerActionError if not authenticated
 */
export async function requireAuthentication(fileName: string, functionName: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw ServerActionError.AuthenticationFailed(fileName, functionName);
  }

  return session;
}

/**
 * Checks if the current user has the required role
 * @param requiredRole The role required to access the resource
 * @param fileName The file name where this helper is called (for error reporting)
 * @param functionName The function name where this helper is called (for error reporting)
 * @returns The session object if authorized
 * @throws ServerActionError if not authenticated or not authorized
 */
export async function requireAuthorization(
  requiredRole: UserRole,
  fileName: string,
  functionName: string
) {
  const session = await requireAuthentication(fileName, functionName);
  
  if (session.user.role !== requiredRole) {
    throw ServerActionError.AuthorizationFailed(fileName, functionName);
  }
  
  return session;
}

/**
 * Checks if the current user has one of the required roles
 * @param requiredRoles Array of roles that are allowed to access the resource
 * @param fileName The file name where this helper is called (for error reporting)
 * @param functionName The function name where this helper is called (for error reporting)
 * @returns The session object if authorized
 * @throws ServerActionError if not authenticated or not authorized
 */
export async function requireAuthorizationMultiRole(
  requiredRoles: UserRole[],
  fileName: string,
  functionName: string
) {
  const session = await requireAuthentication(fileName, functionName);
  
  if (!requiredRoles.includes(session.user.role as UserRole)) {
    throw ServerActionError.AuthorizationFailed(fileName, functionName);
  }
  
  return session;
}