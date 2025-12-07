import { View, Text, TextInput, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { authFetchMobile, fetchProductById } from '@/lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AdminEdit() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id ? Number(params.id) : undefined;
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetchProductById(id);
      if (!res.ok) return;
      const data = await res.json();
      setProduct(data);
    })();
  }, [id]);

  const handleUpdate = async () => {
    setError('');
    const res = await authFetchMobile(`/products/${id}`, { method: 'PUT', body: JSON.stringify({ name: product.name, price: Number(product.price), stock: Number(product.stock), category: product.category, description: product.description, barcode: product.barcode }) });
    if (!res.ok) { const b = await res.json().catch(() => null); setError(b?.error || 'Failed'); return; }
    router.push('/(tabs)/products');
  };

  const handleDelete = async () => {
    setError('');
    const res = await authFetchMobile(`/products/${id}`, { method: 'DELETE' });
    if (!res.ok) { const b = await res.json().catch(() => null); setError(b?.error || 'Failed'); return; }
    router.push('/(tabs)/products');
  };

  if (!id) return <View><Text>Invalid product id</Text></View>;
  if (!product) return <View><Text>Loading...</Text></View>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>Edit Product</Text>
      <TextInput value={product.name} onChangeText={(t) => setProduct({ ...product, name: t })} placeholder="Name" style={{ borderWidth: 1, padding: 8 }} />
      <TextInput value={String(product.price)} onChangeText={(t) => setProduct({ ...product, price: Number(t) })} placeholder="Price" keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput value={String(product.stock)} onChangeText={(t) => setProduct({ ...product, stock: Number(t) })} placeholder="Stock" keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput value={product.category} onChangeText={(t) => setProduct({ ...product, category: t })} placeholder="Category" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput value={product.description || ''} onChangeText={(t) => setProduct({ ...product, description: t })} placeholder="Description" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput value={product.barcode || ''} onChangeText={(t) => setProduct({ ...product, barcode: t })} placeholder="Barcode" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
      <Button title="Update" onPress={handleUpdate} />
      <View style={{ height: 8 }} />
      <Button title="Delete" onPress={handleDelete} color="red" />
    </View>
  );
}
