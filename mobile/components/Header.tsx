import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function MobileHeader() {
  const router = useRouter();

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#1e40af',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#1e3a8a',
      }}
    >
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: -0.5,
          }}
        >
          MyDimz
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
          <Text
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 13,
              paddingVertical: 6,
              paddingHorizontal: 10,
            }}
          >
            🛍️ Produk
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 13,
              paddingVertical: 6,
              paddingHorizontal: 10,
            }}
          >
             Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
