import IORedis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { logger } from '../../../common/logger';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_URL = process.env.REDIS_URL || undefined;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

logger.info(`Setting up redis for Graphql subscriptions...`);

const options: IORedis.RedisOptions = {
  path: REDIS_URL,
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  retryStrategy: (times) => Math.max(times * 100, 3000),
  keepAlive: 5000,
};

// create Redis-based pub-sub
export const graphqlPubsub = new RedisPubSub({
  publisher: new IORedis(options),
  subscriber: new IORedis(options),
});
