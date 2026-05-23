import { Queue } from "bullmq";
import connection from "../redis/connection";

const searchIndexQueue = new Queue("search-index", { connection });

export default searchIndexQueue;
