import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Worker } from "bullmq";
import dotenv from "dotenv";
import { s3 } from "../lib/aws-sdk.js";
import ffmpeg from "fluent-ffmpeg";
import connection from "../lib/redis.js";
import { Writable } from "stream";

dotenv.config();

const thumbnailWorker = new Worker(
  "thumbnail-worker",
  async (job) => {
    const { videoUrl, postId, postUrl } = job.data;

    const bucketName = "neuropost";
    const videoKey = videoUrl;

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: videoKey,
    });
    const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 300 });

    const chunks: any[] = [];
    const memoryWritableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    const thumbnailKey = `${postUrl}thumbnails/${postId}.jpg`;

    await new Promise<void>((resolve, reject) => {
      ffmpeg(signedUrl)
        .seekInput("00:00:00.500")
        .frames(1)
        .format("image2")
        .on("end", () => resolve())
        .on("error", (err: any) => reject(err))
        .pipe(memoryWritableStream);
    });

    const imageBuffer = Buffer.concat(chunks);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: thumbnailKey,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      }),
    );

    return { thumbnailKey };
  },
  {
    connection,
    concurrency: 2,
  },
);

thumbnailWorker.on("completed", (job, result) => {
  console.log(
    `Completed job ${job.id}. Thumbnail saved to: ${result.thumbnailKey}`,
  );
});

thumbnailWorker.on("failed", (job, err) => {
  console.log(`Failed job ${job?.id}:`, err.message);
});

console.log("thumbnail extractor worker running");
