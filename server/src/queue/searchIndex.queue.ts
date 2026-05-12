import { Queue } from "bullmq";
import connection from "../lib/redis.js";

const searchIndexQueue = new Queue("search-index", { connection });

await searchIndexQueue.setGlobalRateLimit(1, 1000);

export default searchIndexQueue;
