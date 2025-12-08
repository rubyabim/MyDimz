import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken, removeToken } from '@/lib/api';

export default function MobileHeader() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const token = await getToken();
    setIsAdmin(!!token);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin logout?',
      [
        {
          text: 'Batal',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await removeToken();
            setIsAdmin(false);
            router.replace('/');
          },
          style: 'destructive',
        },
      ]
    );
  };

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

        {isAdmin ? (
          <>
            <TouchableOpacity onPress={() => router.push('/admin/new')}>
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: 13,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                }}
              >
                ⚙️ Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text
                style={{
                  color: '#fca5a5',
                  fontWeight: '600',
                  fontSize: 13,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                }}
              >
                🚪 Logout
              </Text>
            </TouchableOpacity>
          </>
        ) : (
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
              🔑 Login
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
