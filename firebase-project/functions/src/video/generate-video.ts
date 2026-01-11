import { GoogleGenAI } from "@google/genai";
import { AIVideoBucket, GenerateVideoParams, VideoTask } from "./types/video.type";
import { processVideoTask, validateVideoConfigFields } from "./video.util";

/**
 *
 * @param {GenerateVideoParams} data      Generate video request object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function generateVideoFunction(data: VideoTask) {
  const variables = validateVideoConfigFields();
  if (!variables) {
    return "";
  }

  const { genAIOptions, aiVideoOptions } = variables;

  try {
    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    return await generateVideoURL({ ai, ...aiVideoOptions }, data);
  } catch (error) {
    console.error("Error generating video:", error);
    throw new Error("Error generating video");
  }
}

/**
 *
 * @param {boolean} isVeo31Used    whether or not veo 3.1 model is used
 * @param {string} imageParams    Generate  Video Request
 * @return {GenerateVideoParams} augmented video request
 */
function constructVideoArguments(isVeo31Used: boolean, imageParams: GenerateVideoParams) {
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
 * @param {GenerateVideoParams} imageParams    Generate  Video Request
 * @return {string} video uri
 */
async function generateVideoURL(aiVideo: AIVideoBucket, imageParams: VideoTask) {
  const args = constructVideoArguments(aiVideo.isVeo31Used, imageParams);
  return processVideoTask(aiVideo, imageParams.taskId, args);
}
