import { View, Text, TextInput, Button, SafeAreaView, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { authFetchMobile, fetchProductById } from '@/lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MobileHeader from '@/components/Header';

export default function AdminEdit() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id ? Number(params.id) : undefined;
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const colorScheme = useColorScheme();

  const bgColor = '#ffffff';
  const cardBg = '#FFFFFF';
  const textColor = '#1e3a8a';
  const borderColor = '#e2e8f0';
  const primary = '#1e40af';

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await fetchProductById(id);
      if (!data) {
        setError('Produk tidak ditemukan');
        setLoading(false);
        return;
      }
      setProduct(data);
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async () => {
    if (!product.name || !product.price || !product.stock || !product.category) {
      setError('Nama, harga, stok, dan kategori harus diisi');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await authFetchMobile(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: product.name,
          price: Number(product.price),
          stock: Number(product.stock),
          category: product.category,
          description: product.description,
          barcode: product.barcode,
          image: product.image,
        }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => null);
        setError(b?.error || 'Gagal update produk');
        setSubmitting(false);
        return;
      }

      Alert.alert('Sukses', 'Produk berhasil diupdate!', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/products'),
        },
      ]);
    } catch (err) {
      console.error('Update product error:', err);
      setError('Terjadi kesalahan');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Hapus Produk',
      'Apakah Anda yakin ingin menghapus produk ini?',
      [
        {
          text: 'Batal',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Hapus',
          onPress: async () => {
            setError('');
            setSubmitting(true);

            try {
              const res = await authFetchMobile(`/products/${id}`, { method: 'DELETE' });

              if (!res.ok) {
                const b = await res.json().catch(() => null);
                setError(b?.error || 'Gagal hapus produk');
                setSubmitting(false);
                return;
              }

              Alert.alert('Sukses', 'Produk berhasil dihapus!', [
                {
                  text: 'OK',
                  onPress: () => router.push('/(tabs)/products'),
                },
              ]);
            } catch (err) {
              console.error('Delete product error:', err);
              setError('Terjadi kesalahan');
              setSubmitting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <MobileHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#dc2626', fontSize: 16 }}>ID produk tidak valid</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <MobileHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: textColor, fontSize: 16 }}>⏳ Memuat produk...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <MobileHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ color: textColor, fontSize: 16, marginBottom: 12 }}>Produk tidak ditemukan</Text>
          <TouchableOpacity
            style={{
              backgroundColor: primary,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <MobileHeader />
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}>
        <View
          style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: borderColor,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: primary,
              marginBottom: 20,
            }}
          >
            Edit Produk
          </Text>

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

          {/* Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary, marginBottom: 6 }}>
              Nama Produk
            </Text>
            <TextInput
              value={product.name}
              onChangeText={(t) => setProduct({ ...product, name: t })}
              placeholder="Nama produk"
              placeholderTextColor="#cbd5e1"
              editable={!submitting}
              style={{
                borderWidth: 1.5,
                borderColor: borderColor,
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
              }}
            />
          </View>

          {/* Price */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary, marginBottom: 6 }}>
              Harga
            </Text>
            <TextInput
              value={String(product.price)}
              onChangeText={(t) => setProduct({ ...product, price: Number(t) })}
              placeholder="0"
              placeholderTextColor="#cbd5e1"
              keyboardType="numeric"
              editable={!submitting}
              style={{
                borderWidth: 1.5,
                borderColor: borderColor,
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
              }}
            />
          </View>

          {/* Stock */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary, marginBottom: 6 }}>
              Stok
            </Text>
            <TextInput
              value={String(product.stock)}
              onChangeText={(t) => setProduct({ ...product, stock: Number(t) })}
              placeholder="0"
              placeholderTextColor="#cbd5e1"
              keyboardType="numeric"
              editable={!submitting}
              style={{
                borderWidth: 1.5,
                borderColor: borderColor,
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
              }}
            />
          </View>

          {/* Category */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary, marginBottom: 6 }}>
              Kategori
            </Text>
            <TextInput
              value={product.category}
              onChangeText={(t) => setProduct({ ...product, category: t })}
              placeholder="Kategori"
              placeholderTextColor="#cbd5e1"
              editable={!submitting}
              style={{
                borderWidth: 1.5,
                borderColor: borderColor,
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
              }}
            />
          </View>

          {/* Image */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary, marginBottom: 6 }}>
              URL Gambar
            </Text>
            <TextInput
              value={product.image || ''}
              onChangeText={(t) => setProduct({ ...product, image: t })}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#cbd5e1"
              editable={!submitting}
              style={{
                borderWidth: 1.5,
                borderColor: borderColor,
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
              }}
            />
          </View>

          {/* Description */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary, marginBottom: 6 }}>
              Deskripsi
            </Text>
            <TextInput
              value={product.description || ''}
              onChangeText={(t) => setProduct({ ...product, description: t })}
              placeholder="Deskripsi produk"
              placeholderTextColor="#cbd5e1"
              multiline
              numberOfLines={4}
              editable={!submitting}
              style={{
                borderWidth: 1.5,
                borderColor: borderColor,
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Barcode */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary, marginBottom: 6 }}>
              Barcode
            </Text>
            <TextInput
              value={product.barcode || ''}
              onChangeText={(t) => setProduct({ ...product, barcode: t })}
              placeholder="Barcode"
              placeholderTextColor="#cbd5e1"
              editable={!submitting}
              style={{
                borderWidth: 1.5,
                borderColor: borderColor,
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                color: textColor,
                backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc',
              }}
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={submitting}
            style={{
              backgroundColor: primary,
              paddingVertical: 13,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 12,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              {submitting ? '⏳ Mengupdate...' : '✏️ Update Produk'}
            </Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            disabled={submitting}
            style={{
              backgroundColor: '#dc2626',
              paddingVertical: 13,
              borderRadius: 10,
              alignItems: 'center',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              🗑️ Hapus Produk
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
    centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    errorMessage: {
    color: '#dc2626',
    fontSize: 16,
  },
    loadingText: {
    fontSize: 16,
  },
    notFoundContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
    notFoundText: {
    fontSize: 16,
    marginBottom: 12,
  },
    backButton: {
    paddingVertical: 10,
  },
});