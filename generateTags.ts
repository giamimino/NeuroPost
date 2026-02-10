import { neon } from "@neondatabase/serverless";
import { faker } from "@faker-js/faker";

const sql = neon("postgresql://neondb_owner:npg_wqzX76LGOymc@ep-small-king-agiw7x61-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
const tagsLength = 100;

const tags = faker.helpers.uniqueArray(
  () => faker.word.noun(),
  tagsLength
)

console.log(tags);

const placeholder = tags.map((_, i) => `($${i + 1})`)

await sql.query(`INSERT INTO tags (tag) VALUES ${placeholder}`, tags)