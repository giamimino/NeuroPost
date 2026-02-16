const { neon } = require("@neondatabase/serverless");

const db = neon(
  "postgresql://neondb_owner:npg_wqzX76LGOymc@ep-small-king-agiw7x61-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
);

const count = async () => {
  const response = await db`SELECT COUNT(*) FROM search_index;`;
  console.log(response);
};

count();

const size = async () => {
  const response =
    await db`SELECT pg_size_pretty(pg_total_relation_size('search_index'));`;
  console.log(response);
};
size();

const findTopTag = async () => {
  const response = await db`
  SELECT t_id, post_count
  FROM (
    SELECT t.id AS t_id, COUNT(p.post_id) AS post_count
    FROM tags t
    JOIN post_tag p ON t.id = p.tag_id
    GROUP BY t.id
  ) sub
  ORDER BY post_count DESC
  LIMIT 1;
`;
  console.log("response", response);
};

findTopTag();
