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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {};

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        useStore.getState().setIsAdmin(false);
      }

      const body = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        body.error || `Request failed with status ${response.status}`,
        response.status,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error. Please check your connection.', 0);
  }
}

export async function fetchCars(
  filters?: CarFilters & { all?: boolean },
): Promise<{ cars: Car[]; totalActive: number }> {
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

export async function createCar(
  data: Omit<Partial<Car>, 'tags'> &
    { tags?: string | string[] } &
    {
      name: string;
      brand: string;
      model: string;
      year: number;
      price: number;
      fuelType: string;
      transmission: string;
      kmDriven: number;
      ownerType: string;
      location: string;
      description: string;
      contactPhone: string;
    },
): Promise<Car> {
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

export async function uploadImages(files: File[]): Promise<string[]> {
  const paths: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError(
          'Your session has expired. Please log out and log back in as admin, then try again.',
          401,
        );
      }
      if (response.status === 404) {
        throw new ApiError(
          'Photo upload is not available in this deployment yet. Deploy the latest upload API route and try again.',
          404,
        );
      }
      const body = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new ApiError(body.error || 'Upload failed', response.status);
    }

    const result = await response.json() as { paths: string[] };
    paths.push(...result.paths);
  }

  return paths;
}

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) return false;
      const result = await response.json().catch(() => ({ error: 'Admin login failed.' }));
      throw new ApiError(result.error || 'Admin login failed.', response.status);
    }

    const result = await response.json() as { success?: boolean };
    if (!result.success) return false;

    useStore.getState().setIsAdmin(true);
    return true;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return false;
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/check`, {
      credentials: 'include',
    });

    if (!response.ok) {
      useStore.getState().setIsAdmin(false);
      return false;
    }

    const result = await response.json() as { authenticated?: boolean };
    useStore.getState().setIsAdmin(result.authenticated === true);
    return result.authenticated === true;
  } catch {
    useStore.getState().setIsAdmin(false);
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore network failures; clear the local admin UI state regardless.
  } finally {
    useStore.getState().setIsAdmin(false);
  }
}

export async function fetchStats(): Promise<Stats & { topViewedCars: Car[]; inactiveCars: number }> {
  return request<Stats & { topViewedCars: Car[]; inactiveCars: number }>('/stats');
}

export async function trackClick(
  carId: string,
  type: 'call' | 'whatsapp',
): Promise<void> {
  request<void>(`/stats/${encodeURIComponent(carId)}`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  }).catch(() => {
    // Tracking must not block the UI.
  });
}
