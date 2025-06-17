import { clerkClient, auth } from '@clerk/nextjs/server';

/**
 * Server-side admin utilities for checking admin privileges
 * These functions can only be used in server components, API routes, or middleware
 */

/**
 * Check if a user has admin role using server-side Clerk client
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.privateMetadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if the current authenticated user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    return await isUserAdmin(userId);
  } catch (error) {
    console.error('Error checking current user admin status:', error);
    return false;
  }
}

/**
 * Middleware helper to check admin access
 */
export async function checkAdminAccess(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  return await isUserAdmin(userId);
} 