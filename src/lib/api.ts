import type { Car, CarFilters, Stats } from './types';
import { useStore } from './store';

const API_BASE = '/api';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Get the current auth token from the Zustand store */
function getAuthToken(): string | null {
  return useStore.getState().authToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: HeadersInit = {};

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Bearer token if available (for authenticated requests)
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
      credentials: 'include', // Include cookies as fallback
    });

    if (!response.ok) {
      // If we get a 401, clear the stale auth token but keep the UI stable
      // so the user can re-login without losing context.
      if (response.status === 401) {
        const store = useStore.getState();
        store.setAuthToken(null);
        // Note: we don't flip isAdmin here — the next protected action will
        // surface a clear "session expired" message instead.
      }

      const body = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        body.error || `Request failed with status ${response.status}`,
        response.status
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error. Please check your connection.', 0);
  }
}

// --- Cars ---

export async function fetchCars(filters?: CarFilters & { all?: boolean }): Promise<{ cars: Car[]; totalActive: number }> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.fuelType) params.set('fuelType', filters.fuelType);
    if (filters.transmission) params.set('transmission', filters.transmission);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.minYear !== undefined) params.set('minYear', String(filters.minYear));
    if (filters.maxYear !== undefined) params.set('maxYear', String(filters.maxYear));
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    if (filters.all) params.set('all', 'true');
  }

  const queryString = params.toString();
  const path = `/cars${queryString ? `?${queryString}` : ''}`;

  const result = await request<{ cars: Car[]; total: number; totalActive: number }>(path);
  return { cars: result.cars, totalActive: result.totalActive };
}

export async function fetchFeaturedCars(): Promise<Car[]> {
  const result = await request<{ cars: Car[]; total: number }>('/cars?featured=true');
  return result.cars;
}

export async function fetchCar(idOrSlug: string): Promise<Car> {
  const result = await request<{ car: Car }>(`/cars/${encodeURIComponent(idOrSlug)}`);
  return result.car;
}

export async function createCar(data: Omit<Partial<Car>, 'tags'> & { tags?: string | string[] } & { name: string; brand: string; model: string; year: number; price: number; fuelType: string; transmission: string; kmDriven: number; ownerType: string; location: string; description: string; contactPhone: string }): Promise<Car> {
  const result = await request<{ car: Car }>('/cars', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.car;
}

export async function updateCar(id: string, data: Record<string, unknown>): Promise<Car> {
  const result = await request<{ car: Car }>(`/cars/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result.car;
}

export async function deleteCar(id: string): Promise<void> {
  await request<void>(`/cars/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function toggleCarActive(id: string, active: boolean): Promise<void> {
  await request<void>(`/cars/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

// --- Images ---

export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  // For FormData, we need to manually add the auth header
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include', // cookie fallback for stale Bearer tokens
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Don't immediately clear the token — the cookie might still be valid.
      // Prompt the user to re-login so they can retry without losing form data.
      throw new ApiError('Your session has expired. Please log out and log back in as admin, then try again.', 401);
    }
    const body = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new ApiError(body.error || 'Upload failed', response.status);
  }

  const result = await response.json();
  return result.paths;
}

// --- Auth ---

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (!response.ok) return false;

    const result = await response.json();

    if (result.success && result.token) {
      // Store the auth token in Zustand (and localStorage via the setter)
      useStore.getState().setAuthToken(result.token);
      useStore.getState().setIsAdmin(true);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) return false;

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/auth/check`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) return false;

    const result = await response.json();

    if (!result.authenticated) {
      // Token is invalid, clear it
      useStore.getState().setAuthToken(null);
      useStore.getState().setIsAdmin(false);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
  } catch {
    // Ignore errors
  } finally {
    // Always clear the local token
    useStore.getState().setAuthToken(null);
    useStore.getState().setIsAdmin(false);
  }
}

// --- Stats ---

export async function fetchStats(): Promise<Stats & { topViewedCars: Car[]; inactiveCars: number }> {
  return request<Stats & { topViewedCars: Car[]; inactiveCars: number }>('/stats');
}

// --- Tracking ---

export async function trackClick(
  carId: string,
  type: 'call' | 'whatsapp'
): Promise<void> {
  // Fire and forget — don't block the UI
  request<void>(`/stats/${encodeURIComponent(carId)}`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  }).catch(() => {
    // Silently ignore tracking errors
  });
}
