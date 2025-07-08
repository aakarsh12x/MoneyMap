// Market Data Cache Utility
class MarketDataCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get cached data if it exists and is not expired
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Set data in cache with timestamp
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Clear specific key
  clearKey(key) {
    this.cache.delete(key);
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Check if cache has key
  has(key) {
    return this.cache.has(key);
  }
}

// Create singleton instance
const marketDataCache = new MarketDataCache();

export default marketDataCache; 