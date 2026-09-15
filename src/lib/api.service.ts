/**
 * api.service.ts — Client HTTP centralisé pour Zaphir Frontend
 * 
 * Toutes les requêtes vers le backend Express passent par ce module.
 * Les cookies JWT (httpOnly) sont envoyés automatiquement via credentials: 'include'.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Try refresh token
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!refreshRes.ok) {
      // Refresh failed — user must re-login
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new ApiError('Session expirée', 401);
    }
    
    // Retry original request — caller should handle this
    throw new ApiError('Token refreshed, retry needed', 401);
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(
      (errorData as any)?.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  async get<T = unknown>(path: string, options?: ApiOptions): Promise<T> {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        ...options?.headers,
      },
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },

  async post<T = unknown>(path: string, body?: unknown, options?: ApiOptions): Promise<T> {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },

  async put<T = unknown>(path: string, body?: unknown, options?: ApiOptions): Promise<T> {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },

  async delete<T = unknown>(path: string, options?: ApiOptions): Promise<T> {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        ...options?.headers,
      },
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },
};

export { ApiError };
export default api;
