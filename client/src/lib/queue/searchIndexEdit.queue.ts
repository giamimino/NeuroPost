import { Queue } from "bullmq";
import connection from "../redis/connection";

const searchIndexEditQueue = new Queue("search-index-edit", { connection })

export default searchIndexEditQueue