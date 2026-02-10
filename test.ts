import { neon } from "@neondatabase/serverless";

const sql = neon(
  "postgresql://neondb_owner:npg_wqzX76LGOymc@ep-small-king-agiw7x61-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
);

async function getPosts(tag: string) {
  try {
    const posts = await sql.query(
      `SELECT p.*, json_agg(json_build_object('id', t.id, 'tag', t.tag)) as tags FROM tags t JOIN post_tag pt
      ON t.id = pt.tag_id JOIN posts p ON p.id = pt.post_id 
      WHERE t.tag = $1 GROUP BY p.id`,
      [tag],
    );
    console.log(posts.map(p => ({id: p.id, tags: JSON.stringify(p.tags)})))
  } catch (error) {
    console.error(error);
  }
}

getPosts("gia");
