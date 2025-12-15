import {GenerateVideosParameters, GoogleGenAI} from "@google/genai";
import express from "express";
import {AIVideoBucket, GenerateVideoRequest} from "./types/video.type";
import {validate} from "./validate";

process.loadEnvFile();

const isVeo31Used = (process.env.IS_VEO31_USED || "false") === "true";
const pollingPeriod = Number(process.env.POLLING_PERIOD_MS || "10000");

/**
 *
 * @param {NodeJS.ProcessEnv} env         a dicitonary of environment variables
 * @param {express.Response} response    express response object
 * @return {object} an object containing validated environment variables or undefined if validation fails
 */
function validateVideoConfigFields(env: NodeJS.ProcessEnv, response: express.Response) {
  const project = validate(process.env.GCLOUD_PROJECT,
    "Google Cloud Project Id", response);

  if (!project) {
    return;
  }

  const location = validate(process.env.GOOGLE_CLOUD_LOCATION,
    "Vertex Location", response);

  if (!location) {
    return;
  }

  const vertexai = validate(process.env.GOOGLE_GENAI_USE_VERTEXAI,
    "Use Vertex AI", response
  );
  if (!vertexai) {
    return;
  }

  const model = validate(process.env.GEMINI_VIDEO_MODEL_NAME,
    "Gemini Video Model Name", response
  );
  if (!model) {
    return;
  }

  const strFirebaseConfig = validate(env.FIREBASE_CONFIG, "Firebase config", response);
  if (!strFirebaseConfig) {
    return;
  }

  const firebaseConfig = JSON.parse(strFirebaseConfig);
  const storageBucket = validate(firebaseConfig?.storageBucket, "Storage Bucket", response);
  if (!storageBucket) {
    return;
  }

  return {
    genAIOptions: {
      project,
      location,
      vertexai: vertexai.toLowerCase() === "true",
    },
    model,
    storageBucket,
  };
}

/**
 *
 * @param {express.Request} request      express request object
 * @param {express.Response} response    express response object
 * @return {void} write the video bytes to the response or an error message
 */
export async function generateVideoFunction(request: express.Request, response: express.Response) {
  const variables = validateVideoConfigFields(process.env, response);
  if (!variables) {
    return;
  }

  const {genAIOptions, model, storageBucket} = variables;

  try {
    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    const uri = await generateBase64Video({ai, model, storageBucket}, request.body as GenerateVideoRequest);
    response.status(200).send(JSON.stringify({uri}));
  } catch (error) {
    console.error("Error generating video:", error);
    response.status(500).send("Error generating video");
    return;
  }
}

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {string} request    Generate  Video Request
 * @return {string} video btyes in base64 format
 */
async function generateVideoByPolling(
  { ai, model, storageBucket }: AIVideoBucket,
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
 * @param {string} imageParams    Generate  Video Request
 * @return {GenerateVideoRequest} augmented video request
 */
function constructVideoArguments(imageParams: GenerateVideoRequest) {
  const veoConfig = isVeo31Used ? {
    aspectRatio: "16:9",
    resolution: "720p",
  } : {
    aspectRatio: "16:9",
  };

  return {
    prompt: imageParams.prompt,
    imageBytes: imageParams.imageBytes,
    mimeType: imageParams.mimeType,
    config: veoConfig,
  };
}

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {GenerateVideoRequest} imageParams    Generate  Video Request
 * @return {string} video btyes in base64 format
 */
async function generateBase64Video(aiVideo: AIVideoBucket, imageParams: GenerateVideoRequest) {
  const args = constructVideoArguments(imageParams);
  return generateVideoByPolling(aiVideo, args);
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
    return uri;
  }

  const strError = "Video generation finished but no uri was provided.";
  console.error(strError);
  throw new Error(strError);
}
