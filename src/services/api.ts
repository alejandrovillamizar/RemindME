const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('No fue posible conectar con RemindME. Comprueba tu conexión y la dirección de la API.', 0);
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => ({})) as {
    message?: string;
    errors?: unknown;
  };

  if (!response.ok) {
    throw new ApiError(payload.message ?? 'Ocurrió un error al comunicarse con el servidor.', response.status, payload.errors);
  }

  return payload as T;
}

export const apiConfiguration = {
  baseUrl: API_BASE_URL,
};
