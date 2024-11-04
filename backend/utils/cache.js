const NodeCache = require('node-cache');

// Cache will expire after 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

const cacheService = {
  get: (key) => {
    return cache.get(key);
  },

  set: (key, data) => {
    cache.set(key, data);
  },

  delete: (key) => {
    cache.del(key);
  },

  flush: () => {
    cache.flushAll();
  },

  // Get stats about cache usage
  getStats: () => {
    return {
      keys: cache.keys(),
      stats: cache.getStats()
    };
  }
};

module.exports = cacheService; 