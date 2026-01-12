import { Stack } from 'expo-router';
import React from 'react';

export default function ProductsLayout() {
  return (
    <Stack>
      {/* Mengatur halaman detail dengan parameter dinamis [id] */}
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
