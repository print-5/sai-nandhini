/**
 * Authenticated fetch wrapper for admin API calls
 * Automatically includes credentials (cookies) for authentication
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include", // Always include cookies for authentication
    headers: {
      ...options.headers,
    },
  });
}

/**
 * Authenticated fetch with JSON body
 */
export async function adminFetchJSON(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return adminFetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
