export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/** Authenticated fetch wrapper */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...fetchOpts } = options;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...fetchOpts, headers });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json.data ?? json;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  age: number | null;
  profileComplete: boolean;
}

/**
 * Fetches fresh user data from the API.
 * Can be used by both Client and Server Components if they have the token.
 */
export async function fetchUserData(token: string | null) {
  if (!token) return null;
  try {
    return await apiFetch<UserResponse>("/me", { token, cache: "no-store" });
  } catch {
    return null;
  }
}
