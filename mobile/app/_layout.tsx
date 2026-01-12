import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// TAMBAHKAN INI - Import tailwind.css untuk NativeWind
import '../tailwind.css';

// Mengambil status mode gelap atau terang dari pengaturan HP pengguna
import { useColorScheme } from '@/hooks/use-color-scheme';

// Memastikan aplikasi selalu kembali ke menu utama (tabs) jika terjadi refresh atau error.
export const unstable_settings = {
  anchor: '(tabs)',
};

// Komponen utama yang mengatur struktur dasar dan tema aplikasi.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="products" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
