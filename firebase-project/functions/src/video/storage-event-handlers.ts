import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import logger from "firebase-functions/logger";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import path from "path";

initializeApp();

export const onVideoCreated = onObjectFinalized({}, (event) => {
  const fileBucket = event.data.bucket; // Storage bucket containing the file.
  const filePath = event.data.name; // File path in the bucket.
  const contentType = event.data.contentType; // File content type.

  const taskId = path.parse(filePath).name;

  const projectId = JSON.parse(process.env.FIREBASE_CONFIG || "{}").projectId || "";
  const defaultBucket = `${projectId}.firebasestorage.app`;

  if (fileBucket !== defaultBucket) {
    logger.warn(`Event from non-default bucket: ${fileBucket}. Expected: ${defaultBucket}`);
    return;
  }

  if (contentType !== "video/mp4") {
    logger.warn(`File ${event.data.name} is not video/mp4 content type.`);
    return;
  }

  logger.log(`File ${filePath} uploaded to bucket ${fileBucket}`);

  const db = getFirestore();
  db.collection("video-tasks").doc(taskId).update({
    status: "COMPLETED",
    videoUri: filePath,
    contentType,
    finishedAt: new Date().toISOString(),
  });

  logger.log(`Update (taskId: ${taskId}, videoUri: ${filePath}) to COMPLETED status`);
});

