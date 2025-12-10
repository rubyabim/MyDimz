import MapView, { Marker } from 'react-native-maps';
import { Linking } from 'react-native';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { fetchPublicProducts, getToken } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const [products, setProducts] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const screenWidth = Dimensions.get('window').width;
  
  // Tentukan jumlah kolom berdasarkan lebar layar
  const numColumns = screenWidth >= 1024 ? 4 : screenWidth >= 768 ? 3 : 2;
  
 // Tema warna dominan Putih & Biru
const primary = '#1D4ED8';           // Biru utama (lebih elegan)
// const textDark = colorScheme === 'dark' ? '#E2E8F0' : '#0F172A';      
const cardBg = colorScheme === 'dark' ? '#1E293B' : '#F8FAFC';        
const textSecondary = colorScheme === 'dark' ? '#94A3B8' : '#475569';  


  // Slider images - menggunakan placeholder images
  const backgroundImages = [
    'https://www.mokapos.com/blog/_next/image?url=https%3A%2F%2Fwp.mokapos.com%2Fwp-content%2Fuploads%2F2023%2F02%2Fusaha-sembako-di-rumah-tips-sukses-usaha-toko-kelontong.jpg&w=3840&q=75',
    'https://asset.kompas.com/crops/OK92tO95Kty0YiiTe35Y7aCT9iE=/0x0:780x520/1200x800/data/photo/2019/12/04/5de7435eb2d44.jpg',
    'https://pabriktalirafia.com/wp-content/uploads/2024/04/Rekomendasi-Produk-Toko-Kelontong-Paling-Laris.webp',
  ];

  // Auto slider dengan transisi
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      await getToken();

      const data = await fetchPublicProducts(1, 8);
      if (!data) {
        setProducts([]);
        setError('Tidak dapat terhubung ke server');
        setLoading(false);
        return;
      }

      setProducts(data.products || data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
      setError('Gagal memuat produk');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* HERO SECTION dengan SLIDER dan GRADIENT BACKGROUND */}
        <View style={[styles.heroSection, { backgroundColor: '#2563eb' }]}>
          {/* Background Images with Fade transition */}
          <View style={styles.heroImageContainer}>
            {backgroundImages[bgIndex] && (
              <Image
                source={{ uri: backgroundImages[bgIndex] }}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}
          </View>
          
          {/* Dark Overlay */}
          <View style={styles.heroOverlay} />

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Selamat Datang di Warung Ibuk Iyos</Text>
            <Text style={styles.heroSubtitle}>
              Belanja kebutuhan sehari-hari kini lebih mudah, cepat, dan murah!
            </Text>
          </View>

          {/* Slider Indicators */}
          <View style={styles.sliderIndicators}>
            {backgroundImages.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setBgIndex(idx)}
                style={[
                  styles.indicatorDot,
                  {
                    width: idx === bgIndex ? 24 : 8,
                    backgroundColor: idx === bgIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* KATEGORI SECTION */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        <Text style={[styles.sectionTitle, { color: '#234189' }]}>
            Kategori Produk
          </Text>

          <View style={styles.categoryGrid}>
            {[
              { name: 'Makanan', icon: '🍛' },
              { name: 'Minuman', icon: '🥤' },
              { name: 'Bumbu Dapur', icon: '🧂' },
              { name: 'Kebutuhan Rumah', icon: '🏠' },
            ].map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[styles.categoryCard, { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }]}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={[styles.categoryName, { color: '#1e293b' }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FEATURED PRODUCTS SECTION */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: '#234189' }]}>
              ⭐ Produk Unggulan
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={[styles.viewAllLink, { color: primary }]}>
                Lihat Semua →
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primary} />
            </View>
          ) : error ? (
            <View style={[styles.errorContainer, { backgroundColor: cardBg }]}>
              <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: primary }]}
                onPress={loadProducts}
              >
                <Text style={styles.retryBtnText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: cardBg }]}>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                Belum ada produk tersedia
              </Text>
            </View>
          ) : (
            <FlatList
              data={products}
              numColumns={numColumns}
              scrollEnabled={false}
              keyExtractor={(item) => String(item.id)}
              columnWrapperStyle={styles.productRow}
              renderItem={({ item }) => (
                <View style={{ flex: 1, marginHorizontal: 4 }}>
                  <ProductCard
                    product={item}
                    onPress={() => router.push(`/products/${item.id}`)}
                  />
                </View>
              )}
            />
          )}
        </View>

        {/* FITUR SECTION */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={[styles.sectionTitle, { color: '#234189' }]}>
            Mengapa Memilih Kami?
          </Text>

          {[
            {
              icon: '✓',
              title: 'Harga Terjangkau',
              desc: 'Harga terbaik untuk kebutuhan Anda',
            },
            {
              icon: '📦',
              title: 'Produk Berkualitas',
              desc: 'Pilihan produk terpercaya',
            },
            {
              icon: '🚀',
              title: 'Mudah & Cepat',
              desc: 'Belanja dengan mudah melalui aplikasi',
            },
          ].map((feature, idx) => (
            <View
              key={idx}
             style={[styles.featureCard, { backgroundColor: '#FFFFFF', borderColor: primary + '15' }]}

            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={{ flex: 1 }}>
               <Text style={[styles.featureTitle, { color: '#234189' }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDesc, { color: textSecondary }]}>
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

      {/* CALL TO ACTION */}
<View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
  <TouchableOpacity
    style={[styles.ctaButton, { backgroundColor: primary }]}
    onPress={() => router.push('/(tabs)/products')}
  >
    <Text style={styles.ctaButtonText}>🛍️ Mulai Belanja Sekarang</Text>
  </TouchableOpacity>
</View>

{/* GOOGLE MAPS SECTION */}
<View style={{ paddingHorizontal: 16, paddingVertical: 16 }}></View>
 <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}></Text>

     Lokasi Kami

       </Text>

         {/* MAP BOX */}

           <View
             style={{
               height: 250,
                 borderRadius: 12,
                  overflow: 'hidden',
                   elevation: 4,
                    backgroundColor: '#ddd',

                        }}

                         ></View>

                            <MapView
                            style={{ flex: 1 }}
                             initialRegion={{

                               latitude: -5.364333,
                                longitude: 105.247748,
                                 latitudeDelta: 0.02,
                                 longitudeDelta: 0.02,

                                       }}
                                          >

                                            <Marker
                                             coordinate={{
                                               latitude: -5.364333,
                                               longitude: 105.247748,
                                                }}

                                                 title="Warung Iyos"
                                                 description="Lokasi Warung Ibuk Iyos"
                                                     />

                                                     </MapView>
                                                      </View>

                                                        {/* LINK GOOGLE MAPS */}

                                                        <TouchableOpacity
                                                        onPress={() =>
                                                           Linking.openURL("https://maps.app.goo.gl/UkLV19W9JJu7XT2i6")
                                                            }

                                                              ></TouchableOpacity>
                                                               <Text style={{ marginTop: 10, color: primary, fontSize: 14 }}></Text>

     📍 Lihat di Google Maps →
      </Text>
      </View>
       </TouchableOpacity>
       </View>

       </ScrollView>
       </SafeAreaView>
       );
       }
const styles = StyleSheet.create({
  heroSection: {
    height: 260,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  heroImageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#1e40af',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#f1f5f9',
    textAlign: 'center',
  },
  sliderIndicators: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -40 }],
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  indicatorDot: {
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
