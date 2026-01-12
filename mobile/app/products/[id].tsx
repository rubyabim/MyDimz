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

  // Jalankan kode di dalam setiap kali nilai 'id' berubah
  useEffect(() => {
    // Kalau ID belum siap atau kosong, jangan lakukan apa-apa
    if (!id) return;
    // Panggil fungsi untuk mengambil data produk spesifik dari server
    fetchProduct(id);
  }, [id]);

  // Fungsi untuk mengambil detail produk berdasarkan ID (pid)
  const fetchProduct = async (pid: number) => {
    try {
      // Mulai putar icon loading
      setLoading(true);
      // Panggil fungsi API
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
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.centerContent}>
          <Text style={styles.errorMessage}>ID produk tidak valid</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.notFoundText, { color: textColor }]}>Produk tidak ditemukan</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Kembali</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header with Back Button */}
        <View style={[styles.header, { borderBottomColor: primary + '20' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
            <Text style={[styles.backIcon, { color: primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Detail Produk
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: cardBg }]}>
          <Image
            source={product.image ? { uri: product.image } : require('@/assets/images/react-logo.png')}
            style={styles.productImage}
            contentFit="cover"
          />
          {product.discount && product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{product.discount}%
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Category Badge */}
          {product.category && (
            <View style={styles.categorySection}>
              <View style={[styles.categoryBadge, { backgroundColor: primary }]}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>
          )}

          {/* Product Name */}
          <Text style={[styles.productName, { color: textColor }]}>
            {product.name}
          </Text>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={[styles.productPrice, { color: primary }]}>
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={[styles.originalPrice, { color: textSecondary }]}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionLabel, { color: primary }]}>
                Deskripsi
              </Text>
              <Text style={[styles.descriptionText, { color: textColor }]}>{product.description}</Text>
            </View>
          )}

          {/* Product Details */}
          <View style={[styles.detailsCard, { backgroundColor: cardBg, borderColor: primary + '20' }]}>
            <View style={[styles.stockSection, { borderBottomColor: primary + '20' }]}>
              <Text style={styles.detailLabel}>
                Stok Tersedia
              </Text>
              <Text style={[
                styles.stockValue,
                { color: product.stock > 0 ? primary : '#dc2626' }
              ]}>
                {product.stock > 0 ? `${product.stock} unit` : 'Stok Habis'}
              </Text>
            </View>

            {product.barcode && (
              <View>
                <Text style={styles.detailLabel}>
                  Barcode
                </Text>
                <Text style={[styles.barcodeText, { color: textColor }]}>
                  {product.barcode}
                </Text>
              </View>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              { backgroundColor: product.stock > 0 ? primary : '#9ca3af' }
            ]}
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
            <Text style={styles.addToCartText}>
              {product.stock > 0 ? '🛒 Tambah ke Keranjang' : 'Stok Habis'}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={[styles.shareButton, { borderColor: primary }]}
            onPress={() => {
              Alert.alert('Bagikan', `Share ${product.name}\n\nFitur berbagi akan datang segera`, [{ text: 'OK' }]);
            }}
          >
            <Text style={[styles.shareButtonText, { color: primary }]}>📤 Bagikan Produk</Text>
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
    descriptionSection: {
    marginBottom: 16,
  },
    descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
    descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
    detailsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
    stockSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
    detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
    stockValue: {
    fontSize: 18,
    fontWeight: '700',
  },
    barcodeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
    addToCartButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
    addToCartText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
    shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
    shareButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
});