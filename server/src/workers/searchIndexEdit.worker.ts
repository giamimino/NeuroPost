import { Worker } from "bullmq"
import { sql } from "../lib/db.js";
import connection from "../lib/redis.js";
import dotenv from "dotenv"
import indexPostEdit from "../utils/indexPostEdit.js";
import { SearchIndexWorkerPostType } from "../types/worker.js";

dotenv.config()

const searchIndexEditWorker = new Worker(
  "search-index-edit",
  async (job) => {
    const { postId, words } = job.data;

    const post = await sql.query(
      `SELECT id, title, description FROM posts WHERE id = $1`,
      [postId]
    )

    if(!post || !words) throw Error(`Post with id ${postId} not found`)

    await indexPostEdit(
      post[0] as SearchIndexWorkerPostType,
      words
    )
  },
  {
    connection,
    concurrency: 2
  }
)

searchIndexEditWorker.on("completed", (job) => {
  console.log(`Completed job ${job.id}`);
});

searchIndexEditWorker.on("failed", (job, err) => {
  console.log(`Failed job ${job?.id}:`, err.message);
});

console.log("Search post edit indexing worker running");