import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.redclass.redberryinternship.ge/api";

import { fetchUserData } from "@/lib/api";

/**
 * Server-only helper to get the NextAuth session, token, and fresh user profile.
 * Wrapped in React `cache()` to deduplicate the API request per request-lifecycle.
 */
export const getFreshProfile = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session) return { session: null, token: null, user: null, profileComplete: false };

  const token =
    (session.user as any)?.token ||
    (session.user as any)?.access_token ||
    (session.user as any)?.data?.token ||
    null;

  const fetchedUser = await fetchUserData(token);
  const user = fetchedUser || (session.user as any)?.data?.user || session.user;
  
  return {
    session,
    token,
    user,
    profileComplete: !!user?.profileComplete,
  };
});
