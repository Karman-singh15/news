import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useAuth } from './_layout';

const { width } = Dimensions.get('window');

// Keep dimensions relative to screen size for neat squares
const CARD_SIZE = (width - 48 - 16) / 2; // padding 24 on each side, 16 gap

const CATEGORIES = [
  { id: 'economical', label: 'economical', image: require('../assets/categories/econ.png') },
  { id: 'global', label: 'global', image: require('../assets/categories/global.png') },
  { id: 'sports', label: 'sports', image: require('../assets/categories/sports.png') },
  { id: 'entertainment', label: 'entertainment', image: require('../assets/categories/entertain.png') },
];

export default function Home() {
  const router = useRouter();
  const { session } = useAuth();

  // Try to find the avatar from custom upload, or fallback to Google/Apple identity
  const userMetadata = session?.user?.user_metadata;
  const identityData = session?.user?.identities?.[0]?.identity_data;
  const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture || identityData?.avatar_url || identityData?.picture;

  return (
    <View style={styles.background}>
      {/* 
        The SVG Wave Header Background 
        We use an absolute position so the SafeAreaView content sits on top of it.
      */}
      <View style={styles.waveContainer}>
        <Svg
          height="210"
          width={width}
          viewBox={`0 0 ${width} 210`}
          style={styles.svgCurve}
        >
          <Path
            fill={Colors.primary}
            d={`
                M0,0 
                L${width},0 
                L${width},130 
                C${width * 0.85},100 ${width * 0.65},150 ${width * 0.5},130 
                C${width * 0.35},110 ${width * 0.15},160 0,130 
                L0,0 Z
              `}
          />
        </Svg>
      </View>

      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logoText}>news</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/search' as any)}>
              <Ionicons name="search" size={24} color="#FFF" />
            </TouchableOpacity>
            {/* Navigate to Profile */}
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile/profile' as any)}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 34, height: 34, borderRadius: 17 }} />
              ) : (
                <Ionicons name="person-circle-outline" size={34} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Title Area */}
          <View style={styles.titleSection}>
            <Text style={styles.discoverText}>Discover</Text>
            <Text style={styles.subtitleText}>latest news</Text>
          </View>

          {/* Categories Grid */}
          <View style={styles.grid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity key={category.id} style={styles.card} activeOpacity={0.8}>
                <Image
                  source={category.image}
                  style={{ ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' }}
                />
                <Text style={styles.cardText}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Scroll Indicator */}
        <View style={styles.bottomScrollIndicator}>
          <Ionicons name="arrow-down-outline" size={20} color="#FFF" style={styles.arrowIcon} />
          <View>
            <Text style={styles.scrollText}>scroll for</Text>
            <Text style={styles.scrollText}>the latest news</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.background, // Deep black theme
  },
  container: {
    flex: 1,
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 300,
  },
  svgCurve: {
    position: 'absolute',
    top: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 24,
    zIndex: 10,
  },
  logoText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16, // Adjusted slightly based on the deeper wave
    paddingBottom: 100, // Leave room for scroll indicator
    zIndex: 2,
  },
  titleSection: {
    marginBottom: 40,
    marginTop: 40,
  },
  discoverText: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitleText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: 'transparent',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    zIndex: 1,
  },
  bottomScrollIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowIcon: {
    marginTop: 4,
  },
  scrollText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
