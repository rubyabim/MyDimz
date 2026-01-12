import { Stack } from 'expo-router';
import React from 'react';

export default function ProductsLayout() {
  return (
    <Stack>
      {/* Mengatur halaman detail dengan parameter dinamis [id] */}
      <Stack.Screen 
        name="[id]" 
        options={{ 
          // Menyembunyikan header bawaan supaya kita bisa pakai desain custom di halaman detail
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
