import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

export const sql = neon(process.env.DATABASE_URL!);
