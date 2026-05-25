import { Queue } from "bullmq";
import connection from "../redis/connection";

const thumbnailQueue = new Queue("thumbnail-worker", { connection });

export default thumbnailQueue;
