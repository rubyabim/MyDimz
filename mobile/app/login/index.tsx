import { View, Text, Button, TextInput } from 'react-native';
import { useState } from 'react';
import { loginApi, setToken } from '@/lib/api';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    const res = await loginApi(username, password);
    if (!res || !res.ok) {
      const b = await res.json().catch(() => null);
      setError(b?.error || 'Login failed');
      return;
    }
    const data = await res.json();
    await setToken(data.token);
    router.replace('/');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Login</Text>
      <TextInput value={username} onChangeText={setUsername} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
