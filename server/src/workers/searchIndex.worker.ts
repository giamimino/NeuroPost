import { Worker } from "bullmq";
import { sql } from "../lib/db.js";
import connection from "../lib/redis.js";
import indexPost from "../utils/indexPost.js";
import dotenv from "dotenv"

dotenv.config()

const searchIndexWorker = new Worker(
  "search-index",
  async (job) => {
    const { postId } = job.data;

    const post = await sql.query(
      `SELECT id, title, description FROM posts WHERE id = $1`,
      [postId],
    );

    if (!post) throw new Error(`Post with id ${postId} not found`);

    await indexPost(
      post[0] as { id: number; title: string; description: string },
    );
  },
  {
    connection,
    concurrency: 2,
  },
);

searchIndexWorker.on("completed", (job) => {
  console.log(`Completed job ${job.id}`);
})

searchIndexWorker.on("failed", (job, err) => {
  console.log(`Failed job ${job?.id}:`, err.message);
})

worker.process(async (job) => {
  console.log("processing:", job.data);
});

console.log("Search indexing worker running");