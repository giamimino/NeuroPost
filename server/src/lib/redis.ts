import { Redis } from "ioredis";

const connection = new Redis({
  host: process.env.REDIS_SOCKET_HOST,
  port: Number(process.env.REDIS_SOCKET_PORT),
  password: process.env.REDIS_PASSWORD,
  username: "default",
  maxRetriesPerRequest: null,
});

export default connection;
