import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  fetchProducts,
  fetchPublicProducts,
  getToken,
  fetchProductCategories,
} from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MobileHeader from '@/components/Header';

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([] as any[]);
  const [categories, setCategories] = useState([] as any[]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const colorScheme = useColorScheme();
  // Blue theme matching web
  const primary = '#2563eb';
  const bgColor = colorScheme === 'dark' ? '#0f172a' : '#f0f4f8';
  const cardBg = colorScheme === 'dark' ? '#1e293b' : '#ffffff';
  const textColor = colorScheme === 'dark' ? '#f1f5f9' : '#1e3a8a';
  const textSecondary = colorScheme === 'dark' ? '#cbd5e1' : '#64748b';
  const inputBg = colorScheme === 'dark' ? '#1e293b' : '#ffffff';
  const inputBorder = colorScheme === 'dark' ? '#334155' : '#e2e8f0';

  const loadProducts = async (pageNum: number = 1, searchTerm: string = '', category: string = 'all') => {
    try {
      setLoading(true);
      setError('');
      const token = await getToken();
      
      // Gunakan public API jika tidak ada token, protected API jika ada token
      const data = token
        ? await fetchProducts({ page: pageNum, limit: 12, category: category !== 'all' ? category : undefined, search: searchTerm }, token)
        : await fetchPublicProducts(pageNum, 12, searchTerm, category !== 'all' ? category : undefined);
      
      if (!data) {
        setError('Tidak dapat terhubung ke server');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setProducts(data.products || data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Gagal memuat produk. Coba lagi.');
      setProducts([]);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchProductCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts(1, search, selectedCategory);
  }, []);

  useEffect(() => {
    loadProducts(1, search, selectedCategory);
  }, [search, selectedCategory]);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = await getToken();
      setIsAdmin(!!token);
    };
    checkAdmin();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(1, search, selectedCategory);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <MobileHeader />
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          marginBottom: 8,
        }}
        ListHeaderComponent={
          <View style={{ width: '100%', paddingHorizontal: 12, paddingVertical: 16 }}>
            {/* Header */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: textColor,
                  marginBottom: 4,
                }}
              >
                Produk
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: textSecondary,
                }}
              >
                {products.length} produk tersedia
              </Text>
            </View>

            {/* Admin Button */}
            {isAdmin && (
              <Link href="/admin/new" asChild>
                <TouchableOpacity
                  style={{
                    backgroundColor: primary,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    marginBottom: 14,
                    alignItems: 'center',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: 14,
                    }}
                  >
                    + Tambah Produk Baru
                  </Text>
                </TouchableOpacity>
              </Link>
            )}

            {/* Search Input */}
            <View style={{ marginBottom: 14 }}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari produk..."
                placeholderTextColor={textSecondary}
                style={{
                  borderWidth: 1.5,
                  borderColor: primary + '40',
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              />
            </View>

            {/* Category Filter */}
            {categories.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[{ name: 'Semua', count: 0 }, ...categories]}
                  keyExtractor={(item, idx) => `cat-${idx}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedCategory(
                          item.name === 'Semua' ? 'all' : item.name
                        )
                      }
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        marginRight: 8,
                        backgroundColor:
                          item.name === 'Semua'
                            ? selectedCategory === 'all'
                              ? primary
                              : cardBg
                            : selectedCategory === item.name
                            ? primary
                            : cardBg,
                        borderWidth: 1.5,
                        borderColor: primary + '30',
                        elevation: 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 2,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            item.name === 'Semua'
                              ? selectedCategory === 'all'
                                ? '#fff'
                                : textColor
                              : selectedCategory === item.name
                              ? '#fff'
                              : textColor,
                          fontWeight: '600',
                          fontSize: 12,
                        }}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  scrollEventThrottle={16}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1, marginHorizontal: 4 }}>
            <ProductCard
              product={item}
              onPress={() => router.push(`/products/${item.id}`)}
              onAdd={() => {
                Alert.alert(
                  '✓ Berhasil Ditambahkan',
                  `${item.name} ditambahkan ke keranjang`,
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            error ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                <Text
                  style={{
                    color: '#dc2626',
                    fontSize: 16,
                    marginBottom: 12,
                  }}
                >
                  {error}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: primary,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                  }}
                  onPress={() => loadProducts(1, search, selectedCategory)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    Coba Lagi
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 40,
                }}
              >
                <Text style={{ color: textColor, fontSize: 16 }}>
                  Tidak ada produk ditemukan
                </Text>
              </View>
            )
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={primary}
          />
        }
        contentContainerStyle={{
          paddingBottom: 16,
          flexGrow: 1,
        }}
        onEndReachedThreshold={0.5}
      />

      {loading && (
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -25,
            marginTop: -25,
          }}
        >
          <ActivityIndicator size="large" color={primary} />
        </View>
      )}
    </SafeAreaView>
  );
}
