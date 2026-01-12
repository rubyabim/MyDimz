import { Stack } from 'expo-router';
import React from 'react';

export default function LoginLayout() {
  return (
    // Stack: Wadah untuk tumpukan halaman navigasi
    <Stack>
      {/* Mengatur halaman utama (index) di dalam folder login */}
      <Stack.Screen 
        name="index" 
        options={{ 
          // Menyembunyikan header bawaan biar kita bisa bikin desain login full screen
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
