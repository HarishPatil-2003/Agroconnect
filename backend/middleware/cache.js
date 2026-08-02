/**
 * In-Memory Response Caching Middleware
 * 
 * Caches JSON responses for high-read, slow-changing endpoints to minimize database load.
 * Supports:
 *  - Cache Key containing route path and query parameters
 *  - Cache TTL (Time-To-Live) configuration per endpoint
 *  - Programmatic cache invalidation on content changes
 */

const mcache = require('memory-cache');

const cacheMiddleware = (durationSeconds) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = '__express__' + (req.originalUrl || req.url);
    const cachedBody = mcache.get(key);

    if (cachedBody) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.send(cachedBody);
    }

    res.setHeader('X-Cache', 'MISS');
    
    // Intercept res.send to save response payload in memory cache
    const originalSend = res.send;
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        mcache.put(key, body, durationSeconds * 1000);
      }
      originalSend.call(this, body);
    };
    next();
  };
};

/**
 * Invalidate specific cache keys or all cached items
 */
const invalidateCache = (urlPattern) => {
  const keys = mcache.keys();
  keys.forEach(key => {
    if (key.includes(urlPattern)) {
      mcache.del(key);
      console.log(`🧹 [CACHE INVALIDATION] Cleared cache key: ${key}`);
    }
  });
};

module.exports = {
  cacheMiddleware,
  invalidateCache
};
