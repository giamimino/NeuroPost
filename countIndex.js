const { neon } = require("@neondatabase/serverless");

const db = neon(
  "postgresql://neondb_owner:npg_wqzX76LGOymc@ep-small-king-agiw7x61-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
);

const count = async () => {
  const response = await db`SELECT COUNT(*) FROM search_index;`
  console.log(response);
  
}

count()

const size =  async () => {
  const response = await db`SELECT pg_size_pretty(pg_total_relation_size('search_index'));`
  console.log(response);
  
}
size()