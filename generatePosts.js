const { neon } =require("@neondatabase/serverless")
const { faker } =require("@faker-js/faker");

const sql = neon(
  "postgresql://neondb_owner:npg_wqzX76LGOymc@ep-small-king-agiw7x61-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
);

async function call() {
  try {
    const author_id = "e859be23-1c96-442b-9996-e8568d960858";
    const postsLength = 100;
    const rows = [];

    for (let i = 0; i < postsLength; i++) {
      const title = faker.lorem
        .sentence({ min: 2, max: 7 })
        .replace(/'/g, "''");
      const description = faker.lorem
        .paragraph({ min: 2, max: 10 })
        .replace(/'/g, "''");
      const created_at = faker.date.past().toISOString();

      rows.push(title);
      rows.push(description);
      rows.push(created_at);
    }

    const placeholder = Array.from({ length: postsLength}).map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`)
      .join(",");

    const postsResult = (await sql.query(
      `INSERT INTO posts (author_id, title, description, created_at) VALUES ${placeholder} RETURNING id`,
      [author_id, ...rows],
    ))

    const posts = postsResult.map((p) => p.id);
    const tagRows = [];

    for (let i = 0; i < posts.length; i++) {
      const tags = faker.helpers.uniqueArray(
        () => faker.number.int({ min: 76, max: 175 }),
        faker.number.int({ min: 3, max: 5 }),
      );

      for (const tag of tags) {
        tagRows.push([posts[i], tag]);
      }
    }

    const values = tagRows
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(",");
    await sql.query(
      `INSERT INTO post_tag (post_id, tag_id) VALUES ${values}`,
      tagRows.flat(),
    );
  } catch (error) {
    console.error(error);
  }
}

call()