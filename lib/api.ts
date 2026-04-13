const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.redclass.redberryinternship.ge/api";

/**
 * Fetches fresh user data from the API.
 * Can be used by both Client and Server Components if they have the token.
 */
export async function fetchUserData(token: string | null) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}
