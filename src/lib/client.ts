import { createClient, RedisClientType } from "redis";

declare global {
  var redisClient: RedisClientType | undefined;
}

let client: RedisClientType;

if (!global.redisClient) {
  client = createClient({
    url: process.env.REDIS_URL!,
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  global.redisClient = client
} else {
  client = global.redisClient
}

if(!client.isOpen) {
  await client.connect()
}

export default client;
