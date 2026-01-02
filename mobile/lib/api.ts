import AsyncStorage from '@react-native-async-storage/async-storage';

// Detect API base depending on environment (web / android emulator / override via env)
export const API_BASE = (() => {
  // For development: hardcode localhost:3001
  // This works for:
  // - Expo Web running in browser (localhost:8081 -> localhost:3001)
  // - Native/Emulator can be overridden via env variable
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // First check if env variable is explicitly set
  if (process.env.EXPO_PUBLIC_API_BASE_URL && process.env.EXPO_PUBLIC_API_BASE_URL !== 'http://localhost:3001/api') {
    console.log('✅ Using API_BASE from env:', process.env.EXPO_PUBLIC_API_BASE_URL);
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // For development, default to localhost:3001
  // This works in all scenarios (web, iOS, Android)
  const devUrl = 'http://localhost:3001/api';
  console.log('🔗 API_BASE (development):', devUrl);
  return devUrl;
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
