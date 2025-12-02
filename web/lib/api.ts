const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

type FetchProductsParams = {
  publicOnly?: boolean;
  page?: number;
  limit?: number;
};

/**
 * Fetch public products with optional query (category/search/page/limit).
 * Returns the parsed JSON as PublicProductsResponse (object containing products array)
 */
export async function fetchPublicProducts(queryParams?: {category?: string; search?: string; page?: number; limit?: number}) {
  const qs = new URLSearchParams();
  if (queryParams?.category) qs.set('category', queryParams.category);
  if (queryParams?.search) qs.set('search', queryParams.search);
  if (queryParams?.page) qs.set('page', String(queryParams.page));
  if (queryParams?.limit) qs.set('limit', String(queryParams.limit));

  const url = `${API_BASE}/public/products${qs.toString() ? `?${qs.toString()}` : ''}`;
  return fetch(url, { method: 'GET' }).then((r) => r.json());
}

/**
 * Fetch admin products (auth required) - returns an array of products
 */
export async function fetchAdminProducts(token?: string, params?: { search?: string; category?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  if (params?.category) qs.set('category', params.category);
  const url = `${API_BASE}/products${qs.toString() ? `?${qs.toString()}` : ''}`;
  const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
  return fetch(url, { method: 'GET', headers }).then((r) => r.json());
}

export async function loginApi(username: string, password: string) {
  const url = `${API_BASE}/auth/login`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchProductById(id: string) {
  const url = `${API_BASE}/public/products/${id}`;
  return fetch(url, { method: "GET" });
}

export async function authFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null
) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  try {
    const res = await fetch(url, { ...options, headers });
    return res;
  } catch (err: any) {
    // Throw a more descriptive error so calling code can handle and log
    const message = `Failed to fetch ${url}: ${err?.message || String(err)}`;
    console.error(message);
    // Re-throw the original error to preserve stack/flow
    throw new Error(message);
  }
}
