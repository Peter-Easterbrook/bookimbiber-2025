import { useState, useEffect, useRef } from 'react';
import { 
  Image, 
  View, 
  Animated, 
  ActivityIndicator, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

/**
 * OptimizedImage Component
 * Features: Lazy loading, caching, compression, fade-in animation
 * Perfect for book cover images from Google Books API
 */
const OptimizedImage = ({
  source,
  style,
  placeholder,
  fadeDuration = 300,
  cacheKey,
  lazy = true,
  quality = 'medium', // low, medium, high
  resizeMode = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState(null);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(!lazy);

  const cacheDirectory = FileSystem.cacheDirectory + 'images/';
  
  // Convert quality setting to actual parameters
  const getQualityParams = (quality) => {
    switch (quality) {
      case 'low':
        return { width: 150, height: 200 };
      case 'high':
        return { width: 400, height: 600 };
      default: // medium
        return { width: 250, height: 350 };
    }
  };

  // Generate optimized URL for Google Books images
  const optimizeImageUrl = (url, quality) => {
    if (!url || typeof url !== 'string') return url;
    
    // Google Books specific optimizations
    if (url.includes('books.google.com')) {
      const qualityParams = getQualityParams(quality);
      const baseUrl = url.split('&')[0]; // Remove existing parameters
      return `${baseUrl}&fife=w${qualityParams.width}-h${qualityParams.height}&source=gbs_api`;
    }
    
    return url;
  };

  // Create cache key from URL
  const getCacheKey = (url) => {
    if (cacheKey) return cacheKey;
    return url.replace(/[^a-zA-Z0-9]/g, '_') + '_' + quality;
  };

  // Load image with caching
  const loadImage = async () => {
    if (!source?.uri || isLoading) return;

    setIsLoading(true);
    setError(false);

    try {
      const optimizedUrl = optimizeImageUrl(source.uri, quality);
      const key = getCacheKey(optimizedUrl);
      
      // Check if image is cached
      const cachedImagePath = `${cacheDirectory}${key}.jpg`;
      const fileInfo = await FileSystem.getInfoAsync(cachedImagePath);
      
      if (fileInfo.exists) {
        // Load from cache
        setImageSource({ uri: cachedImagePath });
        setIsLoaded(true);
        animateIn();
        onLoad && onLoad();
      } else {
        // Download and cache
        await FileSystem.makeDirectoryAsync(cacheDirectory, { intermediates: true });
        
        const downloadResult = await FileSystem.downloadAsync(
          optimizedUrl,
          cachedImagePath
        );
        
        if (downloadResult.status === 200) {
          setImageSource({ uri: downloadResult.uri });
          setIsLoaded(true);
          animateIn();
          onLoad && onLoad();
          
          // Store metadata for cache management
          await AsyncStorage.setItem(`image_cache_${key}`, JSON.stringify({
            url: optimizedUrl,
            timestamp: Date.now(),
            path: downloadResult.uri
          }));
        } else {
          throw new Error('Download failed');
        }
      }
    } catch (err) {
      console.error('Image loading error:', err);
      setError(true);
      onError && onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Animate image fade-in
  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start();
  };

  // Lazy loading intersection observer simulation
  useEffect(() => {
    if (lazy && isVisible) {
      // Simple lazy loading - load when component mounts and is visible
      // In a more advanced implementation, you'd use intersection observer
      const timer = setTimeout(loadImage, 100);
      return () => clearTimeout(timer);
    } else if (!lazy) {
      loadImage();
    }
  }, [source?.uri, isVisible, quality]);

  // Render loading placeholder
  const renderPlaceholder = () => (
    <View style={[styles.placeholder, style]}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#4A90E2" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.errorIcon}
            resizeMode="contain"
          />
        </View>
      ) : null}
    </View>
  );

  // Main render
  if (!isVisible && lazy) {
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      {!isLoaded && renderPlaceholder()}
      
      {isLoaded && imageSource && (
        <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
          <Image
            source={imageSource}
            style={[styles.image, style]}
            resizeMode={resizeMode}
            {...props}
          />
        </Animated.View>
      )}
    </View>
  );
};

/**
 * Preload images for better performance
 */
export const preloadImages = async (urls, quality = 'medium') => {
  const promises = urls.map(url => {
    return new Promise((resolve) => {
      const optimizedUrl = optimizeImageUrl(url, quality);
      Image.prefetch(optimizedUrl).then(resolve).catch(resolve);
    });
  });
  
  return Promise.allSettled(promises);
};

/**
 * Clear image cache (for settings/maintenance)
 */
export const clearImageCache = async () => {
  try {
    const cacheDir = FileSystem.cacheDirectory + 'images/';
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(cacheDir, { idempotent: true });
    }
    
    // Clear AsyncStorage metadata
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('image_cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
    
    console.log('Image cache cleared successfully');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

/**
 * Get cache size for settings display
 */
export const getCacheSize = async () => {
  try {
    const cacheDir = FileSystem.cacheDirectory + 'images/';
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    
    if (!dirInfo.exists) return 0;
    
    const files = await FileSystem.readDirectoryAsync(cacheDir);
    let totalSize = 0;
    
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${cacheDir}${file}`);
      totalSize += fileInfo.size || 0;
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
};

/**
 * Clean old cache files (keep files from last 30 days)
 */
export const cleanOldCache = async (maxAge = 30 * 24 * 60 * 60 * 1000) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('image_cache_'));
    const now = Date.now();
    
    for (const key of cacheKeys) {
      const metadata = JSON.parse(await AsyncStorage.getItem(key) || '{}');
      const age = now - (metadata.timestamp || 0);
      
      if (age > maxAge) {
        // Remove file
        const fileInfo = await FileSystem.getInfoAsync(metadata.path);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(metadata.path);
        }
        
        // Remove metadata
        await AsyncStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error cleaning old cache:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  errorIcon: {
    width: 40,
    height: 40,
  },
});

export default OptimizedImage;