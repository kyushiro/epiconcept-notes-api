const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function getTenantId(): string | null {
  return localStorage.getItem('tenant_id');
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const tenantId = getTenantId();
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId;
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return { ...headers, ...extra };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(extraHeaders),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData.message ?? errorData.error ?? message;
    } catch {
      // ignore parse error
    }
    const err = new Error(message) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>('POST', path, body, headers),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
