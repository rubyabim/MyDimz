import { View, Text, Alert, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { fetchProductById } from '@/lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
// useColorScheme removed: mobile forced to light theme

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id ? Number(params.id) : undefined;
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Blue theme matching web
  const primary = '#2563eb';
  const bgColor = '#ffffff';
  const cardBg = '#FFFFFF';
  const textColor = '#0f172a';
  const textSecondary = '#64748b';

  useEffect(() => {
    if (!id) return;
    fetchProduct(id);
  }, [id]);

  const fetchProduct = async (pid: number) => {
    try {
      setLoading(true);
      const data = await fetchProductById(pid);
      if (!data) {
        setProduct(null);
      } else {
        setProduct(data);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#dc2626', fontSize: 16 }}>ID produk tidak valid</Text>
          <TouchableOpacity
            style={{
              marginTop: 12,
              backgroundColor: primary,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: textColor, fontSize: 16, marginBottom: 12 }}>Produk tidak ditemukan</Text>
          <TouchableOpacity
            style={{
              backgroundColor: primary,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
    } catch {
      return `Rp ${price}`;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header with Back Button */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: primary + '20',
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Text style={{ color: primary, fontSize: 18, fontWeight: '600' }}>←</Text>
          </TouchableOpacity>
          <Text style={{ color: textColor, fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' }}>
            Detail Produk
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Product Image */}
        <View style={{
          width: '100%',
          height: 320,
          backgroundColor: cardBg,
          marginBottom: 20,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Image
            source={product.image ? { uri: product.image } : require('@/assets/images/react-logo.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          {product.discount && product.discount > 0 && (
            <View style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: '#dc2626',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              elevation: 3,
            }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
                -{product.discount}%
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={{ paddingHorizontal: 16 }}>
          {/* Category Badge */}
          {product.category && (
            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  backgroundColor: primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  alignSelf: 'flex-start',
                  elevation: 1,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{product.category}</Text>
              </View>
            </View>
          )}

          {/* Product Name */}
          <Text style={{ fontSize: 24, fontWeight: '800', color: textColor, marginBottom: 8 }}>
            {product.name}
          </Text>

          {/* Price */}
          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: primary }}>
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={{
                fontSize: 16,
                color: textSecondary,
                textDecorationLine: 'line-through',
              }}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: primary, marginBottom: 4 }}>
                Deskripsi
              </Text>
              <Text style={{ fontSize: 14, color: textColor, lineHeight: 22 }}>{product.description}</Text>
            </View>
          )}

          {/* Product Details */}
          <View
            style={{
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: primary + '20',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: primary + '20' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: textSecondary, marginBottom: 4 }}>
                Stok Tersedia
              </Text>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: product.stock > 0 ? primary : '#dc2626',
              }}>
                {product.stock > 0 ? `${product.stock} unit` : 'Stok Habis'}
              </Text>
            </View>

            {product.barcode && (
              <View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: textSecondary, marginBottom: 4 }}>
                  Barcode
                </Text>
                <Text style={{ fontSize: 14, color: textColor, fontFamily: 'monospace', fontWeight: '500' }}>
                  {product.barcode}
                </Text>
              </View>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={{
              backgroundColor: product.stock > 0 ? primary : '#9ca3af',
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 12,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}
            onPress={() => {
              if (product.stock > 0) {
                Alert.alert(
                  '✓ Berhasil Ditambahkan',
                  `${product.name} ditambahkan ke keranjang`,
                  [{ text: 'OK', style: 'default' }]
                );
              }
            }}
            disabled={product.stock === 0}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 16,
              }}
            >
              {product.stock > 0 ? '🛒 Tambah ke Keranjang' : 'Stok Habis'}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={{
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: primary,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}
            onPress={() => {
              Alert.alert('Bagikan', `Share ${product.name}\n\nFitur berbagi akan datang segera`, [{ text: 'OK' }]);
            }}
          >
            <Text style={{ color: primary, fontWeight: '700', fontSize: 14 }}>📤 Bagikan Produk</Text>
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
  },
    scrollContent: {
    paddingBottom: 20,
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
    backButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
    backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
    notFoundText: {
    fontSize: 16,
    marginBottom: 12,
  },
    header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
    backIconButton: {
    padding: 8,
  },
    backIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
    headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
    headerSpacer: {
    width: 32,
  },
    imageContainer: {
    width: '100%',
    height: 320,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
    productImage: {
    width: '100%',
    height: '100%',
  },
    discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 3,
  },
    discountText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
    infoContainer: {
    paddingHorizontal: 16,
  },
    categorySection: {
    marginBottom: 12,
  },
    categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    elevation: 1,
  },
    categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
    productName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
    priceSection: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
    productPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
    originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
});