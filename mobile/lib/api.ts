import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Detect API base depending on environment (web / android emulator / override via env)
export const API_BASE = (() => {
  const API_PORT = Number(process.env.EXPO_PUBLIC_API_PORT || 5000);
  const API_PATH = '/api';

  const normalize = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

  // Highest priority: explicit env variable
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBase && envBase.trim().length > 0) {
    const normalized = normalize(envBase.trim());
    console.log('✅ Using API_BASE from env:', normalized);
    return normalized;
  }

  // Expo dev can expose the host machine LAN IP via hostUri (e.g. 192.168.1.10:8081).
  // If present, use that hostname with the API port so physical devices can reach the API.
  const hostUri =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.manifest?.hostUri;
  if (typeof hostUri === 'string' && hostUri.includes(':')) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      const inferred = `http://${host}:${API_PORT}${API_PATH}`;
      console.log('✅ Using API_BASE inferred from hostUri:', inferred);
      return inferred;
    }
  }

  // Fallbacks
  // - Android emulator cannot reach your PC via localhost; use 10.0.2.2
  // - iOS simulator + web can use localhost
  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const fallback = `http://${fallbackHost}:${API_PORT}${API_PATH}`;
  console.log('🔗 API_BASE (fallback):', fallback);
  return fallback;
})();

console.log('🔗 API_BASE initialized as:', API_BASE);

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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('❌ authFetchMobile error:', err.message);
      return null as any;
    }
  } catch (err) {
    console.error('❌ authFetchMobile outer error:', err);
    return null as any;
  }
}

export async function loginApi(username: string, password: string) {
  try {
    const url = `${API_BASE}/auth/login`;
    console.log('Attempting login to:', url);
    console.log('Username:', username);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    console.log('Login response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('Login error response:', res.status, errorData);
    }
    
    return res;
  } catch (err) {
    console.error('Login network error:', err);
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
    
    const url = `${API_BASE}/public/products?${qs.toString()}`;
    console.log('📦 Fetching products from:', url);
    
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('✅ Products response status:', res.status);
      
      if (!res.ok) {
        console.error('❌ API error response:', res.status, res.statusText);
        return null;
      }
      
      // Parse JSON so callers get a consistent object with a `products` field
      try {
        const data = await res.json();
        console.log('✅ Products data received, count:', data.products?.length || data.length || 0);
        return data;
      } catch (e) {
        console.error('❌ Failed to parse JSON response:', e);
        return null;
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        console.error('❌ Request timeout (10s)');
      } else {
        console.error('❌ Network error fetching products:', fetchErr.message);
      }
      return null;
    }
  } catch (err) {
    // Outer try-catch for safety
    console.error('❌ Unexpected error in fetchPublicProducts:', err);
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

export async function fetchProductCategories() {
  try {
    const res = await fetch(`${API_BASE}/public/products/categories`);
    if (!res.ok) return null;
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  } catch (err) {
    return null;
  }
}

export async function fetchUserProfile() {
  try {
    const res = await authFetchMobile(`/auth/me`);
    if (!res || !res.ok) return null;
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  } catch (err) {
    return null;
  }
}
