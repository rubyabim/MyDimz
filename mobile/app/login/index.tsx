import { View, Text, TextInput, SafeAreaView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { loginApi, setToken, API_BASE } from '@/lib/api';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MobileHeader from '@/components/Header';

export default function LoginScreen() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const bgColor = '#ffffff';
  const textColor = colorScheme === 'dark' ? '#f1f5f9' : '#1e3a8a';
  const primary = '#1e40af';

  const initializeBackend = async () => {
    try {
      const res = await fetch(`${API_BASE}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      console.log('Backend initialization:', data);
      return res.ok;
    } catch (e) {
      console.error('Init error:', e);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // First attempt login
      let res = await loginApi(username, password);
      
      if (!res) {
        setError('Tidak dapat terhubung ke server. Pastikan backend running di port 5000');
        setLoading(false);
        return;
      }
      
      // If login fails with 401, try initializing backend first
      if (!res.ok && res.status === 401) {
        console.log('User tidak ditemukan, mencoba initialize backend...');
        await initializeBackend();
        
        // Retry login after initialization
        res = await loginApi(username, password);
      }
      
      if (!res || !res.ok) {
        try {
          const errorData = await res?.json();
          setError(errorData?.error || errorData?.message || 'Username atau password salah');
        } catch {
          setError('Username atau password salah');
        }
        setLoading(false);
        return;
      }
      
      // Login successful
      const data = await res.json();
      if (!data.token) {
        setError('Token tidak diterima dari server');
        setLoading(false);
        return;
      }
      
      await setToken(data.token);
      setLoading(false);
      
      Alert.alert('Sukses', 'Login berhasil!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <MobileHeader />
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
        {/* Login Card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: primary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Masuk 
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#64748b',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Silakan login untuk melanjutkan
          </Text>

          {/* Error Message */}
          {error ? (
            <View
              style={{
                backgroundColor: '#fee2e2',
                borderWidth: 1,
                borderColor: '#fca5a5',
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '500' }}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: primary,
                marginBottom: 6,
              }}
            >
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Masukkan username"
              placeholderTextColor="#cbd5e1"
              editable={!loading}
              style={{
                borderWidth: 1.5,
                borderColor: '#e2e8f0',
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: '#f8fafc',
              }}
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: primary,
                marginBottom: 6,
              }}
            >
              Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showPassword}
                editable={!loading}
                style={{
                  borderWidth: 1.5,
                  borderColor: '#e2e8f0',
                  padding: 12,
                  paddingRight: 40,
                  borderRadius: 10,
                  fontSize: 14,
                  color: textColor,
                  backgroundColor: '#f8fafc',
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: 14 }}
              >
                <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: primary,
              paddingVertical: 13,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 12,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              {loading ? '⏳ Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Demo Credentials Note */}
          <Text
            style={{
              fontSize: 12,
              color: '#64748b',
              textAlign: 'center',
              marginTop: 12,
            }}
          >
          
          </Text>

          {/* Debug: Manual init button */}
          <TouchableOpacity
            onPress={initializeBackend}
            style={{
              marginTop: 16,
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Text style={{ fontSize: 11, color: '#0f172a', textAlign: 'center', fontWeight: '500' }}>
          
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
    content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
    loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
});

