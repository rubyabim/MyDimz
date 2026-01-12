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

  // Menyiapkan data atau koneksi di server saat aplikasi mulai jalan
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
    
    console.log('🔐 Login attempt:', { username, API_BASE });
    
    try {
      // First attempt login
      let res = await loginApi(username, password);
      
      if (!res) {
        const errorMsg = `Tidak dapat terhubung ke server.\nAPI Base: ${API_BASE}\nPastikan API running di port 500`;
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      console.log('Login response status:', res.status);
      
      // If login fails with 401, try initializing backend first
      if (!res.ok && res.status === 401) {
        console.log('User tidak ditemukan, mencoba initialize backend...');
        await initializeBackend();
        
        // Retry login after initialization
        res = await loginApi(username, password);
      }
      
      if (!res || !res.ok) {
        try {
          const errorData = await res?.json().catch(() => null);
          const errorMsg = errorData?.error || errorData?.message || `Login gagal (Status: ${res?.status})`;
          console.error('Login error response:', errorMsg);
          setError(errorMsg);
        } catch {
          setError('Username atau password salah');
        }
        setLoading(false);
        return;
      }
      
      // Login successful
      const data = await res.json();
      console.log('Login successful, token received');
      
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
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <MobileHeader />
      <View style={styles.content}>
        {/* Login Card */}
        <View style={styles.loginCard}>
          {/* Title */}
          <Text style={[styles.title, { color: primary }]}>
            Masuk 
          </Text>

          <Text style={styles.subtitle}>
            Silakan login untuk melanjutkan
          </Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: primary }]}>
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Masukkan username"
              placeholderTextColor="#cbd5e1"
              editable={!loading}
              style={[styles.input, { color: textColor }]}
            />
          </View>

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <Text style={[styles.inputLabel, { color: primary }]}>
              Password
            </Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showPassword}
                editable={!loading}
                style={[styles.passwordInput, { color: textColor }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[
              styles.loginButton,
              { backgroundColor: primary, opacity: loading ? 0.6 : 1 }
            ]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? '⏳ Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Demo Credentials Note */}
          <Text style={styles.noteText}>
          
          </Text>

          {/* Debug: Manual init button */}
          <TouchableOpacity
            onPress={initializeBackend}
            style={styles.debugButton}
          >
            <Text style={styles.debugButtonText}>
          
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
    title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
    subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
    errorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
    errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
    inputContainer: {
    marginBottom: 16,
  },
    inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
    input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
    passwordContainer: {
    marginBottom: 20,
  },
    passwordInputWrapper: {
    position: 'relative',
  },
    passwordInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    paddingRight: 40,
    borderRadius: 10,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
    passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
    passwordToggleIcon: {
    fontSize: 18,
  },
    loginButton: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
    loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
    noteText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
    debugButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
    debugButtonText: {
    fontSize: 11,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '500',
  },
});

