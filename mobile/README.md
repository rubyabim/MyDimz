# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Connecting to API server

By default, this project tries to connect to the API server based on runtime:

- Web (Expo web/browser): `http://localhost:5000/api`
- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator: `http://localhost:5000/api`
- Override with `EXPO_PUBLIC_API_BASE_URL` environment variable if needed.

Example PowerShell commands (Windows) to start the API and the mobile app:

```powershell
# Run the API
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\Api"
npm install
npm run dev

# Run the mobile app
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\mobile"
setx EXPO_PUBLIC_API_BASE_URL "http://localhost:5000/api"
npm start
```

If you are using an Android emulator and the app still can't reach the API, use adb to reverse the port mapping:

```powershell
adb reverse tcp:5000 tcp:5000
```

If you are using a real device, set `EXPO_PUBLIC_API_BASE_URL` to your host machine's LAN IP address (e.g., `http://192.168.1.10:5000/api`).

## Membuat produk demo (opsional)

Jika ingin melihat contoh produk seperti "Test Product" (harga 10000) pada UI, jalankan:

```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\Api"
npm run seed-products
```

Ini akan menambahkan beberapa produk contoh jika belum ada, sehingga Anda bisa melihat tampilan produk dan fitur di aplikasi mobile.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Menggunakan Tailwind / NativeWind

Untuk menggunakan Tailwind CSS di app mobile (dan web via Expo), ikuti langkah berikut setelah meng-clone project:

1. Install dependensi:

```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\mobile"
npm install
```

2. Buat CSS untuk web dan jalankan bundler (pada development web, PostCSS akan membangun CSS otomatis):

```powershell
npx tailwindcss -i ./tailwind.css -o ./dist/tailwind.css --watch
```

3. Jalankan app Expo seperti biasa (native dev environment akan menggunakan NativeWind runtime; web akan meng-include CSS dari `tailwind.css`).

Note: Config sample sudah ditambahkan ke repositori (`tailwind.config.js`, `postcss.config.js`, `tailwind.css`). Jika anda ingin mem-build CSS untuk production web, jalankan:

```powershell
npx tailwindcss -i ./tailwind.css -o ./dist/tailwind.css --minify
```

Contoh penggunaan: ada komponen `TailwindExample` di `components/` yang sudah menggunakan className dari NativeWind.

