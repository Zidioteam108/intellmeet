const { getRedis } = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes in seconds

// Save data to Redis with a key
const setCache = async (key, data, ttl = CACHE_TTL) => {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.warn('Cache set failed:', err.message);
  }
};

// Read data from Redis by key
const getCache = async (key) => {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn('Cache get failed:', err.message);
    return null;
  }
};

// Delete cache entry
const deleteCache = async (key) => {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.del(key);
  } catch (err) {
    console.warn('Cache delete failed:', err.message);
  }
};

module.exports = { setCache, getCache, deleteCache };
