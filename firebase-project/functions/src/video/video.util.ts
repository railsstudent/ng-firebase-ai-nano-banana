import { AIVideoBucket, ExtendVideoRequest, GenerateVideoRequest } from "./types/video.type";
import { GenerateVideosParameters, GoogleGenAI } from "@google/genai";
import { validate } from "../validate";

export const VIDEO_CONFIG = (() => {
  console.log("VIDEO_CONFIG initialization: Loading environment variables and validating configuration...");
  process.loadEnvFile();

  const env = process.env;
  const isVeo31Used = (env.IS_VEO31_USED || "false") === "true";
  const pollingPeriod = Number(env.POLLING_PERIOD_MS || "10000");
  const vertexai = (env.GOOGLE_GENAI_USE_VERTEXAI || "false") === "true";

  const missingKeys: string[] = [];
  const model = validate(env.GEMINI_VIDEO_MODEL_NAME, "Gemini Video Model Name", missingKeys);
  const project = validate(env.GCLOUD_PROJECT, "Project ID", missingKeys);

  const apiOptions = constructGenAIOptions(env, vertexai, missingKeys);

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment variables: ${missingKeys.join(", ")}`);
  }

  const genAIOptions = vertexai ? { project, ...apiOptions } : apiOptions;

  return {
    genAIOptions,
    aiVideoOptions: {
      model,
      storageBucket: `${project}.firebasestorage.app`,
      isVeo31Used,
      pollingPeriod,
    },
  };
})();

/**
 *
 * @param {NodeJS.ProcessEnv} env  Environment variables
 * @param {boolean} vertexai  Flag indicating whether Vertex AI is used
 * @param {string[]} missingKeys  Array to collect missing environment variable keys
 * @return {object} GenAI options based on the environment configuration
 */
function constructGenAIOptions(env: NodeJS.ProcessEnv, vertexai: boolean, missingKeys: string[]) {
  if (vertexai) {
    const location = validate(env.GOOGLE_CLOUD_LOCATION, "Vertex Location", missingKeys);
    return {
      vertexai,
      location,
    };
  }

  // For GenAI API, we need to validate the API key as well.
  const apiKey = validate(env.GOOGLE_API_KEY, "Google API Key", missingKeys);
  return {
    vertexai,
    apiKey,
  };
}

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {GenerateVideoRequest} request    Generate  Video Request
 * @return {Promise<string>} video uri
 */
export async function generateVideoByPolling(
  aiVideo: AIVideoBucket,
  request: GenerateVideoRequest,
) {
  return processVideoPolling(aiVideo, {
    prompt: request.prompt,
    config: request.config,
    image: {
      imageBytes: request.imageBytes,
      mimeType: request.mimeType,
    },
  });
}

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {ExtendVideoRequest} request    Generate  Video Request
 * @return {Promise<{ uri: string, mimeType: string }>} video uri and mime type
 */
export async function extendVideoByPolling(
  aiVideo: AIVideoBucket,
  request: ExtendVideoRequest,
) {
  return processVideoPolling(aiVideo, {
    prompt: request.prompt,
    config: request.config,
    video: request.video,
  });
}

type VideoMediaParams = Pick<GenerateVideosParameters, "image" | "video" | "prompt" | "config">;

/**
 * Generic core function for handling video polling operations.
 *  @param {AIVideoBucket} ai      AI video bucket info
 *  @param {VideoMediaParams} mediaParams    Media parameters for video generation
 */
async function processVideoPolling(
  { ai, model, storageBucket, pollingPeriod }: AIVideoBucket,
  mediaParams: VideoMediaParams
) {
  const genVideosParams: GenerateVideosParameters = {
    model,
    ...mediaParams,
    config: {
      ...mediaParams.config,
      numberOfVideos: 1,
      outputGcsUri: `gs://${storageBucket}`,
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
): Promise<{ uri: string, mimeType: string }> {
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

  const video = operation.response?.generatedVideos?.[0]?.video || {};
  const { uri, mimeType } = video;
  if (uri && mimeType) {
    console.log("video uri", uri, mimeType);
    return { uri, mimeType };
  }

  const strError = "Video generation finished but no uri was provided.";
  console.error(strError);
  throw new Error(strError);
}
