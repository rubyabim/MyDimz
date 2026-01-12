import { View, Text, TextInput, Button, SafeAreaView, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { authFetchMobile } from '@/lib/api';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MobileHeader from '@/components/Header';

export default function AdminNew() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('general');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

  const bgColor = '#ffffff';
  const cardBg = '#FFFFFF';
  const textColor = '#1e3a8a';
  const borderColor = '#e2e8f0';
  const primary = '#1e40af';

// Pastikan semua kolom penting sudah diisi sebelum simpan produk baru
  const handleCreate = async () => {
    if (!name || !price || !stock || !category) {
      setError('Nama, harga, stok, dan kategori harus diisi');
      return;
      // Berhenti di sini, jangan lanjut kirim ke server
    }

    // Reset pesan error dan nyalain animasi loading biar user tahu proses dimulai
    setError('');
    setLoading(true);

    try {
      // Kirim data ke API pakai metode POST (untuk bikin data baru)
      const res = await authFetchMobile('/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock),
          category,
          image,
          description,
        }),
      });

      // Kalau server ngasih kode error (misal: data nggak valid atau server sibuk)
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        setError(b?.error || 'Gagal membuat produk');
        setLoading(false);
        return;
      }

      Alert.alert('Sukses', 'Produk berhasil dibuat!', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/products'),
        },
      ]);
    } catch (err) {
      console.error('Create product error:', err);
      setError('Terjadi kesalahan');
      setLoading(false);
    }
  };

    return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <MobileHeader />
      <ScrollView style={styles.scrollView}>
        <View style={[styles.formCard, { borderColor: borderColor }]}>
          <Text style={[styles.title, { color: primary }]}>
            Tambah Produk Baru
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: primary }]}>
              Nama Produk
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama produk"
              placeholderTextColor="#cbd5e1"
              editable={!loading}
              style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' }]}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: primary }]}>
              Harga
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#cbd5e1"
              keyboardType="numeric"
              editable={!loading}
              style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' }]}
            />
          </View>

          {/* Stock */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: primary }]}>
              Stok
            </Text>
            <TextInput
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              placeholderTextColor="#cbd5e1"
              keyboardType="numeric"
              editable={!loading}
              style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' }]}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: primary }]}>
              Kategori
            </Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="general"
              placeholderTextColor="#cbd5e1"
              editable={!loading}
              style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' }]}
            />
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: primary }]}>
              URL Gambar (Opsional)
            </Text>
            <TextInput
              value={image}
              onChangeText={setImage}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#cbd5e1"
              editable={!loading}
              style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' }]}
            />
          </View>

          {/* Description */}
          <View style={styles.descriptionGroup}>
            <Text style={[styles.label, { color: primary }]}>
              Deskripsi (Opsional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Masukkan deskripsi produk"
              placeholderTextColor="#cbd5e1"
              multiline
              numberOfLines={4}
              editable={!loading}
              style={[styles.textArea, { borderColor: borderColor, color: textColor, backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' }]}
            />
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            style={[
              styles.createButton,
              { backgroundColor: primary, opacity: loading ? 0.6 : 1 }
            ]}
          >
            <Text style={styles.createButtonText}>
              {loading ? '⏳ Membuat...' : '✨ Buat Produk'}
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
    scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
    formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
    title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
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
    inputGroup: {
    marginBottom: 16,
  },
    label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
    input: {
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
    descriptionGroup: {
    marginBottom: 20,
  },
    textArea: {
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
    createButton: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
    createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
