import {GenerateVideosParameters, GoogleGenAI} from "@google/genai";
import {AIVideoBucket, GenerateVideoRequest} from "../types/video.type";
import {validate} from "../validate";

/**
 *
 * @return {object} an object containing validated environment variables or undefined if validation fails
 */
export function validateVideoConfigFields() {
  process.loadEnvFile();

  const env = process.env;
  const isVeo31Used = (env.IS_VEO31_USED || "false") === "true";
  const pollingPeriod = Number(env.POLLING_PERIOD_MS || "10000");

  const project = validate(env.GCLOUD_PROJECT,"Google Cloud Project Id");

  if (!project) {
    return;
  }

  const location = validate(env.GOOGLE_CLOUD_LOCATION,"Vertex Location");

  if (!location) {
    return;
  }

  const vertexai = validate(env.GOOGLE_GENAI_USE_VERTEXAI,"Use Vertex AI");
  if (!vertexai) {
    return;
  }

  const model = validate(env.GEMINI_VIDEO_MODEL_NAME,"Gemini Video Model Name");
  if (!model) {
    return;
  }

  const strFirebaseConfig = validate(env.FIREBASE_CONFIG, "Firebase config");
  if (!strFirebaseConfig) {
    return;
  }

  const firebaseConfig = JSON.parse(strFirebaseConfig);
  const storageBucket = validate(firebaseConfig?.storageBucket, "Storage Bucket");
  if (!storageBucket) {
    return;
  }

  return {
    genAIOptions: {
      project,
      location,
      vertexai: vertexai.toLowerCase() === "true",
    },
    aiVideoOptions: {
      model,
      storageBucket,
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
  {ai, model, storageBucket, pollingPeriod}: AIVideoBucket,
  request: GenerateVideoRequest,
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
    operation = await ai.operations.getVideosOperation({operation});
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (operation.error) {
    const strError = `Video generation failed: ${operation.error.message}`;
    console.error(strError);
    throw new Error(strError);
  }

  if (uri) {
    console.log("video uri", uri);
    return uri;
  }

  const strError = "Video generation finished but no uri was provided.";
  console.error(strError);
  throw new Error(strError);
}
