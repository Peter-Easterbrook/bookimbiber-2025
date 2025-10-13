import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'api_cache_';
const CACHE_METADATA_PREFIX = 'cache_meta_';

/**
 * Cache utility for API responses
 */
export const apiCache = {
  /**
   * Store data in cache with timestamp
   */
  async set(key, data, ttl = 24 * 60 * 60 * 1000) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const metaKey = CACHE_METADATA_PREFIX + key;

      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(
        metaKey,
        JSON.stringify({
          timestamp: Date.now(),
          ttl,
        })
      );

      console.log(`✅ Cache set: ${key} (TTL: ${Math.floor(ttl / 3600000)}h)`);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  /**
   * Get data from cache if not expired
   */
  async get(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const metaKey = CACHE_METADATA_PREFIX + key;

      const [dataStr, metaStr] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(metaKey),
      ]);

      if (!dataStr || !metaStr) {
        console.log(`❌ Cache miss: ${key}`);
        return null;
      }

      const metadata = JSON.parse(metaStr);
      const age = Date.now() - metadata.timestamp;

      if (age > metadata.ttl) {
        console.log(
          `⏰ Cache expired: ${key} (age: ${Math.floor(age / 3600000)}h)`
        );
        await this.remove(key);
        return null;
      }

      console.log(`✅ Cache hit: ${key} (age: ${Math.floor(age / 3600000)}h)`);
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  async remove(key) {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_PREFIX + key),
        AsyncStorage.removeItem(CACHE_METADATA_PREFIX + key),
      ]);
      console.log(`🗑️ Cache removed: ${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  },

  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (key) =>
          key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_METADATA_PREFIX)
      );
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  async getMetadata(key) {
    try {
      const metaStr = await AsyncStorage.getItem(CACHE_METADATA_PREFIX + key);
      if (!metaStr) return null;

      const metadata = JSON.parse(metaStr);
      return {
        ...metadata,
        age: Date.now() - metadata.timestamp,
        isExpired: Date.now() - metadata.timestamp > metadata.ttl,
      };
    } catch (error) {
      console.error('Error getting cache metadata:', error);
      return null;
    }
  },
};

/**
 * Debounce utility for rate limiting function calls
 */
export class Debouncer {
  constructor(cooldownMs = 60 * 60 * 1000) {
    this.cooldownMs = cooldownMs;
    this.lastCallTime = {};
  }

  canProceed(key) {
    const now = Date.now();
    const lastCall = this.lastCallTime[key] || 0;
    const timeSinceLastCall = now - lastCall;
    return timeSinceLastCall >= this.cooldownMs;
  }

  getRemainingTime(key) {
    const now = Date.now();
    const lastCall = this.lastCallTime[key] || 0;
    const timeSinceLastCall = now - lastCall;
    const remaining = this.cooldownMs - timeSinceLastCall;
    return Math.max(0, remaining);
  }

  markCalled(key) {
    this.lastCallTime[key] = Date.now();
  }

  reset(key) {
    delete this.lastCallTime[key];
  }
}
