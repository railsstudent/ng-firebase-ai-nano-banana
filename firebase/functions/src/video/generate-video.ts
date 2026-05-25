import { GoogleGenAI } from "@google/genai";
import { GenerateVideoRequest } from "./types/video.type";
import { generateVideoByPolling, VIDEO_CONFIG } from "./video.util";

/**
 *
 * @param {GenerateVideoRequest} data      Generate video request object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function generateVideoFunction(data: GenerateVideoRequest) {
  const { genAIOptions, aiVideoOptions } = VIDEO_CONFIG;

  try {
    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    const args = constructVideoArguments(aiVideoOptions.isVeo31Used, data);
    return await generateVideoByPolling({ ai, ...aiVideoOptions }, args);
  } catch (error) {
    console.error("Error generating video:", error);
    throw new Error("Error generating video");
  }
}

/**
 *
 * @param {boolean} isVeo31Used    whether or not veo 3.1 model is used
 * @param {string} imageParams    Generate  Video Request
 * @return {GenerateVideoRequest} augmented video request
 */
function constructVideoArguments(isVeo31Used: boolean, imageParams: GenerateVideoRequest) {
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
