import {AIVideoBucket, GenerateVideoFromFramesRequest} from "./types/video.type";
import {GoogleGenAI} from "@google/genai";
import {generateVideoByPolling, validateVideoConfigFields} from "./video.util";

/**
 *
 * @param {GenerateVideoFromFramesRequest} data Generate video from frames object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function generateVideoFromFramesFunction(data: GenerateVideoFromFramesRequest) {
  const variables = validateVideoConfigFields();
  if (!variables) {
    return "";
  }

  const {genAIOptions, aiVideoOptions} = variables;

  try {
    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    return await interpolateVideo({ai, ...aiVideoOptions}, data);
  } catch (error) {
    console.error("Error generating video:", error);
    throw new Error("Error generating video");
  }
}

/**
 *
 * @param {boolean} isVeo31Used: whether or not Veo 3.1 model is used
 * @param {string} imageParams    Generate  Video Request
 * @return {GenerateVideoRequest} augmented video request
 */
function constructVideoArguments(isVeo31Used: boolean, imageParams: GenerateVideoFromFramesRequest) {
  const veoConfig = isVeo31Used ? {
    aspectRatio: "16:9",
    resolution: "720p",
    lastFrame: {
      imageBytes: imageParams.lastFrameImageBytes,
      mimeType: imageParams.lastFrameMimeType,
    },
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
 * @param {GenerateVideoFromFramesRequest} imageParams    Generate Video from Frames Request
 * @return {string} video uri
 */
async function interpolateVideo(aiVideo: AIVideoBucket, imageParams: GenerateVideoFromFramesRequest) {
  try {
    const args = constructVideoArguments(aiVideo.isVeo31Used, imageParams);
    return await generateVideoByPolling(aiVideo, args);
  } catch (e) {
    throw e instanceof Error ?
      e :
      new Error("An unexpected error occurred in video generation using the first and last frames.");
  }
}
