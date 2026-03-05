const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
};

export const API_URL = getBaseUrl();

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
