import { GenerateVideosParameters, GoogleGenAI } from "@google/genai";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { HttpsError } from "firebase-functions/https";
import { validate } from "../validate";
import { AIVideoBucket, GenerateVideoParams } from "./types/video.type";

/**
 *
 * @return {object} an object containing validated environment variables or undefined if validation fails
 */
export function validateVideoConfigFields() {
  process.loadEnvFile();

  const env = process.env;
  const isVeo31Used = (env.IS_VEO31_USED || "false") === "true";
  const pollingPeriod = Number(env.POLLING_PERIOD_MS || "10000");
  const vertexai = (env.GOOGLE_GENAI_USE_VERTEXAI || "false") === "true";

  const missingKeys: string[] = [];
  const location = validate(env.GOOGLE_CLOUD_LOCATION, "Vertex Location", missingKeys);
  const model = validate(env.GEMINI_VIDEO_MODEL_NAME, "Gemini Video Model Name", missingKeys);
  const project = JSON.parse(env.FIREBASE_CONFIG || "{}").projectId || "";
  if (!project) {
    missingKeys.push("Project ID");
  }

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment variables: ${missingKeys.join(", ")}`);
  }

  return {
    genAIOptions: {
      project,
      location,
      vertexai,
    },
    aiVideoOptions: {
      model,
      storageBucket: `${project}.firebasestorage.app`,
      isVeo31Used,
      pollingPeriod,
    },
  };
}

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {string} request    Generate  Video Request
 * @return {string} video btyes in base64 format
 */
export async function generateVideoByPolling(
  { ai, model, storageBucket, pollingPeriod }: AIVideoBucket,
  request: GenerateVideoParams,
) {
  const genVideosParams: GenerateVideosParameters = {
    model,
    prompt: request.prompt,
    config: {
      ...request.config,
      numberOfVideos: 1,
      outputGcsUri: `gs://${storageBucket}`,
    },
    image: {
      imageBytes: request.imageBytes,
      mimeType: request.mimeType,
    },
  };

  return getVideoUri(ai, genVideosParams, pollingPeriod);
}

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {string} taskId Video task ID
 * @param {GenerateVideoParams} params    Generate Video Parameters
 * @return {string} video btyes in base64 format
 */
export async function processVideoTask(
  { ai, model, storageBucket }: AIVideoBucket,
  taskId: string,
  params: GenerateVideoParams,
) {
  const now = new Date().toISOString().split("T")[0];
  const genVideosParams: GenerateVideosParameters = {
    model,
    prompt: params.prompt,
    config: {
      ...params.config,
      numberOfVideos: 1,
      outputGcsUri: `gs://${storageBucket}/${now}/${taskId}.mp4`,
    },
    image: {
      imageBytes: params.imageBytes,
      mimeType: params.mimeType,
    },
  };

  return submitVideoTask(ai, taskId, genVideosParams);
}

/**
 *
 * @param {GoogleGenAI} ai      GenAI instance
 * @param {string} taskId    Video task ID
*  @param {GenerateVideosParameters} genVideosParams    Generate  Video Request
 * @return {string} video btyes in base64 format
 */
async function submitVideoTask(
  ai: GoogleGenAI,
  taskId: string,
  genVideosParams: GenerateVideosParameters,
): Promise<void> {
  const db = getFirestore();
  const newTask = db.collection("video-tasks").doc(taskId);

  try {
    newTask.set({
      status: "PROCESSING",
      videoUri: "",
      contentType: "",
      createdAt: new Date().toISOString(),
      finishedAt: "",
    });

    await ai.models.generateVideos(genVideosParams);

    logger.info(`Generation started for taskId: ${taskId}`);
  } catch (error) {
    console.error(error);

    newTask.update({
      status: "FAILED",
      finishedAt: new Date().toISOString(),
    });

    throw new HttpsError("internal", "Video generation failed.");
  }
}

/**
 *
 * @param {GoogleGenAI} ai      GenAI instance
 * @param {GenerateVideosParameters} genVideosParams    Generate  Video Request
 * @param {number} pollingPeriod    Polling period in milliseconds
 * @return {string} video btyes in base64 format
 */
async function getVideoUri(
  ai: GoogleGenAI,
  genVideosParams: GenerateVideosParameters,
  pollingPeriod: number,
): Promise<string> {
  let operation = await ai.models.generateVideos(genVideosParams);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, pollingPeriod));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  if (operation.error) {
    const strError = `Video generation failed: ${operation.error.message}`;
    console.error(strError);
    throw new Error(strError);
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (uri) {
    console.log("video uri", uri);
    return uri;
  }

  const strError = "Video generation finished but no uri was provided.";
  console.error(strError);
  throw new Error(strError);
}
