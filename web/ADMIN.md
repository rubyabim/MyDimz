# Admin Login & Cart Usage

This file explains how to create an admin user, log in as admin from the web UI, and use the cart functionality.

## Create admin user (Backend)

1. Make sure the API server is running (from `MyDimz/Api`):

```powershell
# in PowerShell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\Api"
# ensure .env/config set up, then
npm install
npm run dev
```

2. Create an admin user using the script (runs Prisma directly and creates an admin record):

```powershell
npm run create-admin --silent
```

Default credentials created by this script are:

- Username: admin
- Password: admin123

(You can edit `Api/scripts/create-admin-direct.js` if you'd like a different username or password.)

It will create an admin with default credentials if not specified; check the script (`Api/scripts/create-admin-direct.js`) or provide parameters if you need custom credentials.
4. (Opsional) Isi produk demo untuk melihat contoh produk pada UI:
```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\Api"
npm run seed-products
```
Ini akan menambahkan beberapa produk contoh termasuk `Test Product` (harga 10000).

3. Alternatively, you can generate an auth token directly for a user with `npm run gen-token [userId]` (in `Api`), or `npm run get-token [username] [password]` to call API `/auth/login`.


## Login as Admin (Frontend)

1. Start the frontend dev server:

```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\web"
npm install
npm run dev
```

2. Open: http://localhost:3000
3. Click `Login` in the header and enter the admin credentials you created earlier.

What happens after login:
- Your token is stored in `localStorage` using key `wiibuk_token` by helper `setAuthToken()`.
 - Your token is stored in `localStorage` using key `wiibuk_token` by helper `setAuthToken()` (web).
 - Mobile apps use the same token key (`wiibuk_token`) stored in AsyncStorage for consistency across platforms.
- The `Edit Product` pages (admin-only) use the stored token to authorize updates.
- The header will show `Logout` when an admin is logged in; click it to clear the token.

## Searching Products (Web & Mobile)

- On the web public product list `/products`, use the search box to filter products by name (case-insensitive). You can also filter by category using the category buttons next to the search input.
- On the admin dashboard `/admin`, there is a search input that filters admin product list. This allows searching products specifically for management tasks.
- On mobile, the Products list includes a search field at the top — type to filter products via the backend.


## Cart Usage (Frontend)

This app implements a simple client-only cart using `localStorage` to persist items.

- Add Items:
  - On the product cards or product list, click "🛒 Tambah ke Keranjang" to add a product to the cart.
  - If the product stock is 0, the button is disabled.
- View Cart:
  - Click the cart icon in the header to open the Cart page.
  - The cart shows each item with quantity controls (+/-) and a remove button.
- Persistence:
  - Cart contents persist in the browser `localStorage` under `md-cart-v1`.
  - Clearing the cart is supported from the Cart page.


## How to test admin update + cart together

1. Login as admin.
2. Navigate to a product and click the Edit action (or open `products/[id]` path if the admin UI exists).
3. Modify product stock, save.
4. Go back to the public page, and try adding an item to the cart; if the stock is reduced to zero, the Add button will disable accordingly.


## Notes & Improvements

- The cart is client-only; there's no server-side cart or checkout integration yet.
- If you want server-side carts and checkout (orders & payments), we can extend the API and add endpoints for cart/order.
- For production, secure cookies or HttpOnly cookie + CSRF protection is recommended rather than localStorage for tokens.

If you want, I can now:
- Add a small success toast for Add-to-cart actions.
- Implement server-side cart persist and checkout.
- Flesh out an admin dashboard.

## Mobile (Expo) notes

- When running the mobile app under the web (Expo web) you'll access the API at `http://localhost:5000/api`.
- When running on Android emulator, use `http://10.0.2.2:5000/api`; for iOS simulator `http://localhost:5000/api`; for a real device use your machine's IP (e.g., `http://192.168.1.4:5000/api`).
- You may set `EXPO_PUBLIC_API_BASE_URL` to override the default in the app (Windows - PowerShell example):

```powershell
# Example: from mobile folder
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\mobile"
setx EXPO_PUBLIC_API_BASE_URL "http://localhost:5000/api"
npm start
```

If your mobile app on Android throws "Failed to fetch" in the console, ensure your API is reachable from the emulator / host and that the URL used matches the platform. On Android emulators, you may also use `adb reverse` to map the device port to host:

```powershell
# Reverse TCP 5000 on Android emulator to host 5000 (Windows PowerShell)
adb reverse tcp:5000 tcp:5000
```

If you're using a physical device, replace `localhost` or `10.0.2.2` with your host machine's LAN IP, e.g. `http://192.168.1.10:5000/api`.

---

## Panduan singkat (Bahasa Indonesia)

Berikut langkah-langkah singkat untuk menjalankan API, web, dan mobile, serta cara login ke dashboard admin dan menggunakan fitur pencarian.

1. Jalankan API (Node.js / Express):
```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\Api"
npm install
# Pastikan variabel lingkungan (DATABASE_URL, JWT_SECRET) diatur jika perlu
npm run dev
```

2. (Opsional) Buat akun admin default:
```powershell
npm run create-admin --silent
```
Catatan: Skrip ini akan membuat `username: admin` dan `password: admin123` jika belum ada.

3. Jalankan Web (Next.js):
```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\web"
npm install
npm run dev
```
Buka: http://localhost:3000 lalu klik `Login` ➜ masukkan `admin` / `admin123`.

4. Jalankan Mobile (Expo):
```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\mobile"
npm install
setx EXPO_PUBLIC_API_BASE_URL "http://localhost:5000/api" # jika diperlukan
npm start
```
Tips: Jika aplikasi mobile di Android emulator menampilkan "Failed to fetch", jalankan:
```powershell
adb reverse tcp:5000 tcp:5000
```
Jika menggunakan perangkat fisik, gunakan IP LAN mesin host, contoh: `http://192.168.1.10:5000/api`.

5. Menggunakan dashboard admin (web):
 - Login ke web → header akan menampilkan `Admin` jika login berhasil.
 - Klik `Admin` untuk melihat daftar produk.
 - Gunakan kotak `Search` pada halaman admin untuk mencari produk berdasarkan nama.
 - Tombol `+ New Product` membuat produk baru (admin only).
 - Klik `Admin` untuk melihat daftar produk.
 - Gunakan kotak `Search` pada halaman admin untuk mencari produk berdasarkan nama.
 - Tombol `+ New Product` membuat produk baru (admin only). Anda dapat menambahkan `Image URL` pada form untuk menampilkan gambar.
 - Klik item produk untuk edit. Pada halaman `Edit Product` Anda dapat memodifikasi `Image URL`.
 - Hapus produk: pada dashboard Admin tekan tombol `Delete` di produk lalu konfirmasi. Ini akan mengirim request DELETE ke API (hanya admin dengan token valid).
 - Klik item produk untuk edit. Pada halaman `Edit Product` Anda dapat memodifikasi `Image URL` atau upload file:
   - Untuk upload file: pilih file pada tombol `Upload` lalu klik `Upload`. File akan di-upload ke server dan URL-nya akan disimpan di `Image URL`.
 - Hapus produk: pada dashboard Admin tekan tombol `Delete` di produk lalu konfirmasi. Ini akan mengirim request DELETE ke API (hanya admin dengan token valid).

6. Pencarian pada web publik (`/products`):
 - Gunakan kotak pencarian di header atau kotak di halaman `/products`; hasil akan tampil sebagian (server-side search).

7. Gambar produk tidak muncul?
 - Jika sebuah produk tidak memiliki `image` URL, aplikasi web akan menampilkan `default-product.svg` dari `web/public`.
 - Jika gambar masih tidak tampil, pastikan produk di database memiliki nilai `image` yang valid (URL). Jika Anda memakai URL internal, periksa juga apakah API dan web berjalan di domain yang sama atau allowed via CORS.

Jika masih ada masalah setelah mengikuti langkah di atas, beritahu saya error yang muncul, saya akan bantu lagi.
