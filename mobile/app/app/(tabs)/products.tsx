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
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  fetchPublicProducts,
  fetchProductCategories,
  fetchUserProfile,
  getToken,
} from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProductsScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth >= 1024 ? 4 : screenWidth >= 768 ? 3 : 2;
  const paddingHorizontal = screenWidth >= 768 ? 24 : 12;
  const gap = screenWidth >= 768 ? 12 : 8;
  
  const [products, setProducts] = useState([] as any[]);
  const [categories, setCategories] = useState([] as any[]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const colorScheme = useColorScheme();
  // Blue theme matching web
  const primary = '#2563eb';
  const bgColor = '#ffffff';
  const cardBg = '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#f1f5f9' : '#1e3a8a';
  const textSecondary = colorScheme === 'dark' ? '#cbd5e1' : '#64748b';
  const inputBg = colorScheme === 'dark' ? '#1e293b' : '#ffffff';
  const inputBorder = colorScheme === 'dark' ? '#334155' : '#e2e8f0';

  const loadProducts = async (pageNum: number = 1, searchTerm: string = '', category: string = 'all') => {
    try {
      setLoading(true);
      setError('');
      
      // Gunakan public API
      const data = await fetchPublicProducts(pageNum, 12, searchTerm, category !== 'all' ? category : undefined);
      
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

  const checkUserRole = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const user = await fetchUserProfile();
      setIsAdmin(user?.role === 'admin' || user?.role === 'seller');
    } catch (err) {
      console.error('Error checking user role:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkUserRole();
    loadCategories();
    loadProducts(1, search, selectedCategory);
  }, []);

  useEffect(() => {
    loadProducts(1, search, selectedCategory);
  }, [search, selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(1, search, selectedCategory);
    setRefreshing(false);
  };

return (
    <SafeAreaView style={styles.container}>
      <FlatList
        key={`products-${numColumns}`}
        data={products}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={[
          styles.columnWrapper,
          { paddingHorizontal: gap, marginBottom: gap }
        ]}
        ListHeaderComponent={
          <View style={[styles.headerContainer, { paddingHorizontal: paddingHorizontal }]}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>
                Produk
              </Text>
              <Text style={styles.headerSubtitle}>
                {products.length} produk tersedia
              </Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari produk..."
                placeholderTextColor="#cbd5e1"
                style={[styles.searchInput, { borderColor: primary + '40' }]}
              />
            </View>

            {/* Category Filter */}
            {categories.length > 0 && (
              <View style={styles.categoryContainer}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[{ name: 'Semua', count: 0 }, ...categories]}
                  keyExtractor={(item, idx) => `cat-${idx}`}
                  renderItem={({ item }) => {
                    const isActive = item.name === 'Semua' ? selectedCategory === 'all' : selectedCategory === item.name;
                    return (
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedCategory(
                            item.name === 'Semua' ? 'all' : item.name
                          )
                        }
                        style={[
                          styles.categoryButton,
                          { borderColor: primary + '30', backgroundColor: isActive ? primary : cardBg }
                        ]}
                      >
                        <Text style={[styles.categoryText, { color: isActive ? '#fff' : textColor }]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  scrollEventThrottle={16}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <ProductCard
              product={item}
              isAdmin={isAdmin}
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
              <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: primary }]}
                  onPress={() => loadProducts(1, search, selectedCategory)}
                >
                  <Text style={styles.retryButtonText}>
                    Coba Lagi
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: textColor }]}>
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
        contentContainerStyle={styles.contentContainer}
        onEndReachedThreshold={0.5}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
    columnWrapper: {
    justifyContent: 'space-between',
  },
    headerContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  headerSection: {
    marginBottom: 16,
  },
    headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 4,
  },
    headerSubtitle: {
    fontSize: 14,
    color: '#475569',
  },
    searchContainer: {
    marginBottom: 14,
  },
    searchInput: {
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '500',
  },
    categoryContainer: {
    marginBottom: 16,
  },
    categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
    categoryText: {
    fontWeight: '600',
    fontSize: 12,
  },
    productItem: {
    flex: 1,
    marginHorizontal: 4,
  },
    emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
    errorText: {
    color: '#dc2626',
    fontSize: 16,
    marginBottom: 12,
  },
    retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
    retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
    emptyText: {
    fontSize: 16,
  },
    contentContainer: {
    paddingBottom: 16,
    flexGrow: 1,
  },
    loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
});