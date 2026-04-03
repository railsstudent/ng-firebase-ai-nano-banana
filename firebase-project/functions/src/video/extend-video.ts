import { GoogleGenAI } from "@google/genai";
import { AIVideoBucket, ExtendVideoRequest } from "./types/video.type";
import { extendVideoByPolling, validateVideoConfigFields } from "./video.util";

/**
 *
 * @param {ExtendVideoRequest} data      Extend video request object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function extendVideoFunction(data: ExtendVideoRequest) {
  const variables = validateVideoConfigFields();
  if (!variables) {
    return "";
  }

  const { genAIOptions, aiVideoOptions } = variables;

  try {
    if (!aiVideoOptions.isVeo31Used) {
      throw new Error("Video extension is only supported for Veo 3.1 model");
    }

    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    return await extendVideoURL({ ai, ...aiVideoOptions }, data);
  } catch (error) {
    console.error("Error generating video:", error);
    throw new Error("Error generating video");
  }
}

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {ExtendVideoRequest} videoParams    Extend  Video Request
 * @return {string} video uri
 */
async function extendVideoURL(aiVideo: AIVideoBucket, videoParams: ExtendVideoRequest) {
  return extendVideoByPolling(aiVideo, {
    prompt: videoParams.prompt,
    video: videoParams.video,
    config: videoParams.config,
  });
}
