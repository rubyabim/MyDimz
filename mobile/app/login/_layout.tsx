import { Stack } from 'expo-router';
import React from 'react';

export default function LoginLayout() {
  return (
    // Stack: Wadah untuk tumpukan halaman navigasi
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
