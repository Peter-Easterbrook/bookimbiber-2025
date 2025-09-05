/**
 * Image Optimization Utilities
 * Performance monitoring, batch operations, and optimization strategies
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

/**
 * Image Performance Monitor
 * Tracks loading times, cache hit rates, and optimization metrics
 */
export class ImagePerformanceMonitor {
  constructor() {
    this.metrics = {
      totalLoads: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgLoadTime: 0,
      totalLoadTime: 0,
      errors: 0,
    };
  }

  // Record successful image load
  recordLoad(loadTime, fromCache = false) {
    this.metrics.totalLoads++;
    this.metrics.totalLoadTime += loadTime;
    this.metrics.avgLoadTime = this.metrics.totalLoadTime / this.metrics.totalLoads;
    
    if (fromCache) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  // Record image loading error
  recordError() {
    this.metrics.errors++;
  }

  // Get cache hit rate
  getCacheHitRate() {
    const totalAttempts = this.metrics.cacheHits + this.metrics.cacheMisses;
    return totalAttempts > 0 ? (this.metrics.cacheHits / totalAttempts) * 100 : 0;
  }

  // Get performance summary
  getPerformanceSummary() {
    return {
      ...this.metrics,
      cacheHitRate: this.getCacheHitRate(),
      errorRate: this.metrics.totalLoads > 0 ? 
        (this.metrics.errors / this.metrics.totalLoads) * 100 : 0,
    };
  }

  // Save metrics to storage
  async saveMetrics() {
    try {
      await AsyncStorage.setItem('image_performance_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  // Load metrics from storage
  async loadMetrics() {
    try {
      const stored = await AsyncStorage.getItem('image_performance_metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }
}

/**
 * Batch Image Preloader
 * Efficiently preload multiple book covers for smooth scrolling
 */
export class BatchImagePreloader {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
    this.active = 0;
    this.completed = new Set();
  }

  // Add images to preload queue
  addToQueue(books) {
    const newUrls = books
      .map(book => this.getBookImageUrl(book))
      .filter(url => url && !this.completed.has(url));
    
    this.queue.push(...newUrls);
    this.processQueue();
  }

  // Get image URL from book data
  getBookImageUrl(book) {
    if (book?.thumbnail) {
      return book.thumbnail.replace('http://', 'https://');
    }
    if (book?.coverImage) {
      return book.coverImage.replace('http://', 'https://');
    }
    return null;
  }

  // Process the preload queue
  async processQueue() {
    while (this.queue.length > 0 && this.active < this.maxConcurrent) {
      const url = this.queue.shift();
      if (!url || this.completed.has(url)) continue;

      this.active++;
      this.preloadImage(url).finally(() => {
        this.active--;
        this.processQueue(); // Process next in queue
      });
    }
  }

  // Preload single image
  async preloadImage(url) {
    try {
      const startTime = Date.now();
      await Image.prefetch(url);
      const loadTime = Date.now() - startTime;
      
      this.completed.add(url);
      console.log(`Preloaded image in ${loadTime}ms:`, url.substring(0, 50));
    } catch (error) {
      console.error('Failed to preload image:', error);
    }
  }

  // Clear completed set (reset for new session)
  reset() {
    this.completed.clear();
    this.queue = [];
  }
}

/**
 * Smart Image Quality Selector
 * Automatically select image quality based on device and network conditions
 */
export class SmartQualitySelector {
  constructor() {
    this.deviceTier = 'medium'; // low, medium, high
    this.networkType = 'wifi'; // wifi, cellular, unknown
    this.dataUsageMode = 'auto'; // auto, conservative, performance
  }

  // Detect device performance tier
  async detectDeviceTier() {
    try {
      const { Platform } = await import('react-native');
      const { getConstants } = await import('expo-constants');
      
      if (Platform.OS === 'android') {
        const constants = getConstants();
        const totalMemory = constants.systemSize || 0;
        
        if (totalMemory > 6 * 1024 * 1024 * 1024) { // > 6GB RAM
          this.deviceTier = 'high';
        } else if (totalMemory > 3 * 1024 * 1024 * 1024) { // > 3GB RAM
          this.deviceTier = 'medium';
        } else {
          this.deviceTier = 'low';
        }
      }
    } catch (error) {
      console.error('Device tier detection failed:', error);
    }
  }

  // Get optimal image quality based on conditions
  getOptimalQuality(context = 'list') {
    // Context: 'list' (book list), 'detail' (book detail), 'thumbnail'
    
    const baseQuality = {
      list: { low: 'low', medium: 'low', high: 'medium' },
      detail: { low: 'medium', medium: 'medium', high: 'high' },
      thumbnail: { low: 'low', medium: 'low', high: 'low' },
    };

    let quality = baseQuality[context][this.deviceTier] || 'medium';

    // Adjust for data usage preference
    if (this.dataUsageMode === 'conservative') {
      quality = quality === 'high' ? 'medium' : 'low';
    } else if (this.dataUsageMode === 'performance') {
      quality = quality === 'low' ? 'medium' : 'high';
    }

    // Adjust for network conditions
    if (this.networkType === 'cellular' && this.dataUsageMode !== 'performance') {
      quality = quality === 'high' ? 'medium' : quality;
    }

    return quality;
  }

  // Update settings
  updateSettings(settings) {
    if (settings.dataUsageMode) {
      this.dataUsageMode = settings.dataUsageMode;
    }
  }
}

/**
 * Image Cache Manager
 * Advanced cache management with size limits and cleanup strategies
 */
export class ImageCacheManager {
  constructor(maxCacheSize = 100 * 1024 * 1024) { // 100MB default
    this.maxCacheSize = maxCacheSize;
    this.cacheDirectory = FileSystem.cacheDirectory + 'images/';
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('image_cache_'));
      
      let totalSize = 0;
      let totalFiles = 0;
      const oldestFile = { timestamp: Date.now(), key: null };
      
      for (const key of cacheKeys) {
        const metadata = JSON.parse(await AsyncStorage.getItem(key) || '{}');
        const fileInfo = await FileSystem.getInfoAsync(metadata.path);
        
        if (fileInfo.exists) {
          totalSize += fileInfo.size;
          totalFiles++;
          
          if (metadata.timestamp < oldestFile.timestamp) {
            oldestFile.timestamp = metadata.timestamp;
            oldestFile.key = key;
          }
        }
      }

      return {
        totalSize,
        totalFiles,
        maxSize: this.maxCacheSize,
        usagePercentage: (totalSize / this.maxCacheSize) * 100,
        oldestFile,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { totalSize: 0, totalFiles: 0, usagePercentage: 0 };
    }
  }

  // Clean cache when size limit exceeded
  async cleanupCache() {
    try {
      const stats = await this.getCacheStats();
      
      if (stats.totalSize <= this.maxCacheSize) {
        return; // No cleanup needed
      }

      console.log('Cache cleanup started. Current size:', stats.totalSize);

      // Get all cache entries sorted by timestamp (oldest first)
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('image_cache_'));
      const entries = [];

      for (const key of cacheKeys) {
        const metadata = JSON.parse(await AsyncStorage.getItem(key) || '{}');
        entries.push({ key, metadata });
      }

      entries.sort((a, b) => a.metadata.timestamp - b.metadata.timestamp);

      // Remove oldest entries until under size limit
      let currentSize = stats.totalSize;
      for (const entry of entries) {
        if (currentSize <= this.maxCacheSize * 0.8) break; // 80% of limit

        const fileInfo = await FileSystem.getInfoAsync(entry.metadata.path);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(entry.metadata.path);
          await AsyncStorage.removeItem(entry.key);
          currentSize -= fileInfo.size;
        }
      }

      console.log('Cache cleanup completed. New size:', currentSize);
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  // Schedule regular cleanup
  scheduleCleanup() {
    // Clean up every 24 hours
    setInterval(() => {
      this.cleanupCache();
    }, 24 * 60 * 60 * 1000);
  }
}

// Export singleton instances
export const performanceMonitor = new ImagePerformanceMonitor();
export const imagePreloader = new BatchImagePreloader();
export const qualitySelector = new SmartQualitySelector();
export const cacheManager = new ImageCacheManager();

// Initialize on app start
export const initializeImageOptimization = async () => {
  await performanceMonitor.loadMetrics();
  await qualitySelector.detectDeviceTier();
  cacheManager.scheduleCleanup();
};