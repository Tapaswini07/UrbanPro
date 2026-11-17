export const BACKEND_URL = 'https://urbanpro-packer-backend.onrender.com';

/**
 * Resolves the full URL for backend API requests.
 * - In local dev (localhost / 127.0.0.1) or on the backend host: uses relative paths `/api/...`
 * - In production on `urbanprologistics.com` or static hosting: routes to `https://urbanpro-packer-backend.onrender.com/api/...`
 * - Also honors VITE_API_BASE_URL if explicitly provided in environment variables.
 */
export function getApiUrl(path: string): string {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return `${clean}${path.startsWith('/') ? path : '/' + path}`;
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local');
    const isDirectBackend = hostname.includes('urbanpro-packer-backend');

    if (!isLocalhost && !isDirectBackend) {
      return `${BACKEND_URL}${path.startsWith('/') ? path : '/' + path}`;
    }
  }

  return path;
}
