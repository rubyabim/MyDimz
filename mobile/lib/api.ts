// Detect API base depending on environment (web / android emulator / override via env)
export const API_BASE = (() => {
  // If runtime is web (Expo web or browser), use localhost
  try {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return process.env.EXPO_PUBLIC_API_BASE_URL || `http://localhost:5000/api`;
    }
  } catch (e) {
    // ignore
  }
  return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000/api'; // Android emulator default
})();
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same token key as the web client for consistency across platforms
export const TOKEN_KEY = 'wiibuk_token';
export const setToken = async (token: string | null) => {
  if (token === null) {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
};
export const getToken = async () => await AsyncStorage.getItem(TOKEN_KEY);
export const removeToken = async () => await AsyncStorage.removeItem(TOKEN_KEY);

export async function authFetchMobile(path: string, options: RequestInit = {}) {
  try {
    const token = await getToken();
    const url = `${API_BASE}${path}`;
    const headers: any = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    return res;
  } catch (err) {
    // Network/connection error - return null to callers
    return null as any;
  }
}

export async function loginApi(username: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res;
  } catch (err) {
    return null as any;
  }
}

export async function fetchPublicProducts(page = 1, limit = 12, search?: string, category?: string) {
  try {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    if (search) qs.set('search', String(search));
    if (category) qs.set('category', String(category));
    const res = await fetch(`${API_BASE}/public/products?${qs.toString()}`);
    // Parse JSON so callers get a consistent object with a `products` field
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  } catch (err) {
    // Network/connection error
    return null;
  }
}

export async function fetchProducts({ publicOnly = false, page = 1, limit = 12, search, category }: { publicOnly?: boolean; page?: number; limit?: number; search?: string; category?: string } = {}, token?: string | null) {
  if (publicOnly) return await fetchPublicProducts(page, limit, search, category);
  // Build query string
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (search) qs.set('search', String(search));
  if (category) qs.set('category', String(category));
  const res = await authFetchMobile(`/products?${qs.toString()}`);
  if (!res) return null;
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchProductById(id: number) {
  try {
    const res = await fetch(`${API_BASE}/public/products/${id}`);
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  } catch (err) {
    return null;
  }
}
