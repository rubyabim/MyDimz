import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
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

  // WARNA PUTIH - BIRU SOFT
  const primary = "#3B82F6";           // Biru soft
  const primaryDark = "#1E40AF";       // Biru Navy modern
  const bgColor = colorScheme === "dark" ? "#0B1120" : "#FFFFFF";
  const cardBg = colorScheme === "dark" ? "#1E293B" : "#FFFFFF";
  const textColor = colorScheme === "dark" ? "#E2E8F0" : "#0F172A";
  const textSecondary = colorScheme === "dark" ? "#94A3B8" : "#475569";

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
      {/* IMAGE */}
      <View style={[styles.imageWrap, { backgroundColor: "#F1F5F9" }]}>
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
        {discountPct > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPct}%</Text>
          </View>
        )}

        {/* CATEGORY BADGE */}
        {product.category && (
          <View style={[styles.categoryBadge, { backgroundColor: primary }]}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View style={styles.body}>
        
        {/* TITLE */}
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* RATING */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              {Array.from({ length: 5 })
                .map((_, i) => (i < (product.rating || 0) ? "★" : "☆"))
                .join(" ")}
            </Text>
          </View>
        )}

        {/* PRICE */}
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

        {/* STOCK */}
        <Text
          style={[
            styles.stock,
            { color: product.stock > 0 ? primaryDark : "#DC2626" },
          ]}
        >
          {product.stock > 0 ? `Stok: ${product.stock}` : "Stok Habis"}
        </Text>

        {/* BUTTON */}
        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: product.stock > 0 ? primary : "#E5E7EB" },
          ]}
          onPress={() => {
            if (onAdd) onAdd();
            else if (product.stock > 0)
              Alert.alert("✓ Ditambahkan", `${product.name} ke keranjang`);
          }}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.addBtnText,
              { color: product.stock > 0 ? "#fff" : "#9CA3AF" },
            ]}
          >
            🛒 {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  imageWrap: {
    width: "100%",
    height: 180,
    position: "relative",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  categoryBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  body: {
    padding: 14,
  },

  title: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
  },

  ratingContainer: {
    marginBottom: 6,
  },
  ratingText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "600",
  },

  priceSection: {
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },

  stock: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },

  addBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: {
    fontWeight: "700",
    fontSize: 14,
  },
});
