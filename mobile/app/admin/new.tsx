import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';
import { authFetchMobile } from '@/lib/api';
import { useRouter } from 'expo-router';

export default function AdminNew() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('general');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    const res = await authFetchMobile('/products', { method: 'POST', body: JSON.stringify({ name, price: Number(price), stock: Number(stock), category, image }) });
    if (!res.ok) { const b = await res.json().catch(() => null); setError(b?.error || 'Failed'); return; }
    router.push('/(tabs)/products');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>Create Product</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Name" style={{ borderWidth: 1, padding: 8 }} />
      <TextInput value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput value={stock} onChangeText={setStock} placeholder="Stock" keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput value={category} onChangeText={setCategory} placeholder="Category" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput value={image} onChangeText={setImage} placeholder="Image URL (optional)" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
      <Button title="Create" onPress={handleCreate} />
    </View>
  );
}
