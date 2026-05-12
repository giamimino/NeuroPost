import { Worker } from "bullmq";
import { sql } from "../db";
import connection from "../redis/connection";
import indexPost from "@/utils/indexPost";

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

export default searchIndexWorker;
