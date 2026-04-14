import { Session } from "next-auth";

/**
 * Extracts the API bearer token from a NextAuth session.
 * Handles the various shapes the backend may return.
 */
export function getTokenFromSession(session: Session | null): string | null {
  if (!session?.user) return null;
  const user = session.user as Record<string, unknown>;
  return (
    (user.token as string) ||
    (user.access_token as string) ||
    ((user.data as Record<string, unknown>)?.token as string) ||
    null
  );
}
