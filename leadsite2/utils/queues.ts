import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';

export const redis = new IORedis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export const siteQueue = new Queue('site-gen', { connection: redis });
export const whatsappQueue = new Queue('whatsapp', { connection: redis });

// Schedulers keep delayed jobs alive across restarts
export const siteScheduler = new QueueScheduler('site-gen', { connection: redis });
export const whatsappScheduler = new QueueScheduler('whatsapp', { connection: redis });
