import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


import { fetchUserData } from "@/lib/api";
import { getTokenFromSession } from "@/lib/token";

/**
 * Server-only helper to get the NextAuth session, token, and fresh user profile.
 * Wrapped in React `cache()` to deduplicate the API request per request-lifecycle.
 */
export const getFreshProfile = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session) return { session: null, token: null, user: null, profileComplete: false };

  const token = getTokenFromSession(session);

  const fetchedUser = await fetchUserData(token);
  const user = fetchedUser || (session.user as any)?.data?.user || session.user;
  
  const isComplete = Boolean(
    user?.fullName && 
    user?.email && 
    user?.mobileNumber && 
    user?.age
  );
  
  return {
    session,
    token,
    user,
    profileComplete: isComplete,
  };
});
