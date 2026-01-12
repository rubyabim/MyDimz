WARUNG IBUK IYOS - Sistem Manajemen Toko Kelontong

Sistem lengkap untuk mengelola toko kelontong dengan fitur:
- Backend API dengan Next.js & TypeScript
- Web Admin Dashboard dengan Next.js
- Website Public untuk customer
- Database psql
- Laporan PDF otomatis

1. Setup Backend
powershell
cd Api
npm install --legacy-peer-deps
npx prisma generate --schema prisma/schema.prisma
npx prisma db push --schema prisma/schema.prisma
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev



2. Setup Web
powershell
cd web
npm install --legacy-peer-deps
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev



3. Inisialisasi Admin
powershell
Invoke-WebRequest -Method POST http://localhost:5000/api/init -UseBasicParsing | Select-Object -ExpandProperty Content


4. Setup Mobile (Expo)
powershell
cd mobile
npm install --legacy-peer-deps
expo start



 FITUR UTAMA

 Backend API (Port 5000)
 Authentication JWT
 CRUD Produk
 Manajemen Penjualan
 Laporan PDF
 Public API untuk produk

Web Application (Port 3000)
 Website public untuk customer
 Admin dashboard
 Manajemen produk
 Edit harga & stok real-time
 Generate laporan

 API ENDPOINTS

 Public Routes
- GET /api/public/products- List produk
- GET /api/public/products/categories - Kategori produk
- GET /api/public/products/:id- Detail produk

### Protected Routes (Perlu login)
- POST /api/auth/login- Login admin
- GET /api/products - List produk (admin)
- POST /api/products - Tambah produk
- PUT /api/products/:id - Edit produk
- DELETE /api/products/:id - Hapus produk
- POST /api/sales- Buat penjualan
- GET /api/sales - Riwayat penjualan
- GET /api/reports/daily - Laporan harian PDF
- GET /api/reports/monthly - Laporan bulanan PDF

 LOGIN 

Admin Panel:
- URL: http://localhost:3000/dashboard
Website Public:
- URL: http://localhost:3000
- URL Produk: http://localhost:3000/products

DATABASE

Menggunakan SQLite dengan Prisma ORM. File database: backend/dev.db

Tabel:
- users- Data user admin/kasir
- products - Data produk
- sales - Data penjualan
- sale_items - Item dalam penjualan

 FITUR LAPORAN

Laporan Harian
- Ringkasan penjualan harian
- Detail transaksi
- Total item terjual

Laporan Bulanan
- Ringkasan bulanan
- Penjualan per hari
- Rata-rata transaksi

 DEVELOPMENT

Backend Development
bash
cd backend
npm run dev  # Development mode dengan auto-reload


Web Development
bash
cd web
npm run dev  # Development mode


Database Management
bash
npx prisma studio  # GUI untuk melihat data


📱 MOBILE APP (Future)

Aplikasi mobile untuk POS (Point of Sale) akan dikembangkan menggunakan React Native.


