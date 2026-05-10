const Redis = require('ioredis');

let redis;

const connectRedis = () => {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      tls: process.env.REDIS_URL.includes('upstash.io') ? {} : undefined,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('❌ Redis: Max retries reached. Stopping reconnection.');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('ready', () => {
      console.log('✅ Redis ready to use');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    redis.on('close', () => {
      console.warn('⚠️ Redis connection closed');
    });

  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }

  return redis;
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
