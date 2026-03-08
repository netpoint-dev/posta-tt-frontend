export const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getApiUrl = (path: string) => `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = getApiUrl(path);
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return response;
}
