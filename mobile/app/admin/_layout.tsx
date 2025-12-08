import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="new" 
        options={{ 
          headerShown: true,
          title: 'Tambah Produk',
          headerBackTitle: 'Kembali',
        }} 
      />
      <Stack.Screen 
        name="edit/[id]" 
        options={{ 
          headerShown: true,
          title: 'Edit Produk',
          headerBackTitle: 'Kembali',
        }} 
      />
    </Stack>
  );
}
