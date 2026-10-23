import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const redis = process.env.UPSTASH_REDIS_URL
  ? new IORedis(process.env.UPSTASH_REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

export const siteQueue = new Queue('site-gen', { connection: redis });
export const whatsappQueue = new Queue('whatsapp', { connection: redis });
