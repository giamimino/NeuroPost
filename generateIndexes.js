const { neon } = require("@neondatabase/serverless");

const db = neon(
  "postgresql://neondb_owner:npg_wqzX76LGOymc@ep-small-king-agiw7x61-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
);
const now = new Date();
const rows = [];

const getPosts = async () => {
  const posts = await db`SELECT title, description, id FROM posts`;

  const index = {};

  for (const post of posts) {
    const fields = ["title", "description"];

    for (const field of fields) {
      const words = post[field].toLowerCase().replace(/[.,]/g, "").split(/\s+/);

      for (const word of words) {
        if (!index[word]) index[word] = {};
        if (!index[word][post.id]) index[word][post.id] = {};
        index[word][post.id][field] = true;
      }
    }
  }

  for (const idx of Object.keys(index)) {
    const indexObject = { [idx]: index[idx] };

    await db`
    INSERT INTO search_index ("index")
    VALUES (${JSON.stringify(indexObject)})
  `;
  }

  console.log(new Date().getTime() - now.getTime() + "ms");
};

getPosts();
