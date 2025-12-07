import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Product = {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  stock: number;
  category?: string;
  image?: string;
};

export default function ProductCard({
  product,
  onPress,
  onAdd,
}: {
  product: Product;
  onPress?: () => void;
  onAdd?: () => void;
}) {
  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(price);
    } catch {
      return `Rp ${price}`;
    }
  };

  const colorScheme = useColorScheme();
  // Use blue-600 as primary color (matching web design)
  const primary = '#2563eb';
  const bgColor = colorScheme === 'dark' ? '#0f172a' : '#f8fafc';
  const cardBg = colorScheme === 'dark' ? '#1e293b' : '#ffffff';
  const textColor = colorScheme === 'dark' ? '#f1f5f9' : '#0f172a';
  const textSecondary = colorScheme === 'dark' ? '#cbd5e1' : '#64748b';

  const discountPct = product.discountPrice
    ? Math.round(
        ((product.price - (product.discountPrice || product.price)) /
          product.price) *
          100
      )
    : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* IMAGE CONTAINER */}
      <View style={[styles.imageWrap, { backgroundColor: bgColor }]}>
        <Image
          source={
            product.image
              ? { uri: product.image }
              : require('@/assets/images/partial-react-logo.png')
          }
          style={styles.image}
          contentFit="cover"
        />
        
        {/* DISCOUNT BADGE */}
        {discountPct > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{`-${discountPct}%`}</Text>
          </View>
        ) : null}

        {/* CATEGORY BADGE */}
        {product.category ? (
          <View style={[styles.categoryBadge, { backgroundColor: primary }]}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        ) : null}
      </View>

      {/* CONTENT SECTION */}
      <View style={styles.body}>
        {/* TITLE */}
        <Text 
          style={[styles.title, { color: textColor }]} 
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* RATING */}
        {product.rating ? (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              {Array.from({ length: 5 })
                .map((_, i) => (i < (product.rating || 0) ? '★' : '☆'))
                .join(' ')}
            </Text>
          </View>
        ) : null}

        {/* PRICING SECTION */}
        <View style={styles.priceSection}>
          {product.discountPrice ? (
            <>
              <Text style={[styles.price, { color: primary }]}>
                {formatPrice(product.discountPrice)}
              </Text>
              <Text style={[styles.originalPrice, { color: textSecondary }]}>
                {formatPrice(product.price)}
              </Text>
            </>
          ) : (
            <Text style={[styles.price, { color: primary }]}>
              {formatPrice(product.price)}
            </Text>
          )}
        </View>

        {/* STOCK INFO */}
        <Text style={[
          styles.stock,
          { color: product.stock > 0 ? primary : '#dc2626' }
        ]}>
          {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
        </Text>

        {/* ADD TO CART BUTTON */}
        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: product.stock > 0 ? primary : '#e5e7eb' }
          ]}
          onPress={() => {
            if (onAdd) {
              onAdd();
            } else if (product.stock > 0) {
              Alert.alert(
                '✓ Berhasil Ditambahkan',
                `${product.name} ditambahkan ke keranjang`
              );
            }
          }}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.addBtnText,
            { color: product.stock > 0 ? '#fff' : '#9ca3af' }
          ]}>
            🛒 {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
  },
  imageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  ratingText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  priceSection: {
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  stock: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  addBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
});
