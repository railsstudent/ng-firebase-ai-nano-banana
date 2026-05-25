import { GoogleGenAI } from "@google/genai";
import { ExtendVideoRequest } from "./types/video.type";
import { extendVideoByPolling, VIDEO_CONFIG } from "./video.util";

/**
 *
 * @param {ExtendVideoRequest} data      Extend video request object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function extendVideoFunction(data: ExtendVideoRequest) {
  const { genAIOptions, aiVideoOptions } = VIDEO_CONFIG;

  try {
    if (!aiVideoOptions.isVeo31Used) {
      throw new Error("Video extension is only supported for Veo 3.1 model");
    }

    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    return await extendVideoByPolling({ ai, ...aiVideoOptions }, {
      prompt: data.prompt,
      video: data.video,
      config: data.config,
    });
  } catch (error) {
    console.error("Error generating video:", error);
    throw new Error("Error generating video");
  }
}

