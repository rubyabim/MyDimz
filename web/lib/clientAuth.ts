"use client";
// Menandakan bahwa file ini dijalankan di sisi client (browser)
// Diperlukan karena menggunakan localStorage dan window
// Key untuk menyimpan token di localStorage
const TOKEN_KEY = "wiibuk_token";
// Menyimpan token autentikasi  ke localStorage
export function setAuthToken(token: string) {
  // Cek agar tidak dijalankan di server (SSR)
  if (typeof window === "undefined") return;
  // Simpan token  ke localStoragee
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  // Pastikan kode hanya berjalan di browser
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
// Menghapus token autentikasi (logout)
export function clearAuthToken() {
  // Cegah error saat dijalankan di server
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}
// Mengambil data profil user  yang sedang login Menggunakan endpoint /auth/me
export async function getUserProfile() {
  try {
    // Ambil token dari localStorage
    const token = getAuthToken();

    // Jika token tidak ada, user dianggap belum login
    if (!token) return null;
// Request ke API backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:500/api"}/auth/me`,
      {
        headers: {
          // Token dikirim melalui Authorization Header
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export function isAdmin(user: any): boolean {
  return user?.role === "admin" || user?.role === "seller";
}
