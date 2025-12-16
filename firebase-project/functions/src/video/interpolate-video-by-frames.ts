import {GoogleGenAI} from "@google/genai";
import {AIVideoBucket, GenerateVideoFromFramesRequest} from "../types/video.type";
import {generateVideoByPolling, validateVideoConfigFields} from "./video.util";
import express from "express";

process.loadEnvFile();

/**
 *
 * @param {express.Request} request      express request object
 * @param {express.Response} response    express response object
 * @return {void} write the video bytes to the response or an error message
 */
export async function generateVideoFromFramesFunction(request: express.Request, response: express.Response) {
  const variables = validateVideoConfigFields(process.env, response);
  if (!variables) {
    return;
  }

  const {genAIOptions, aiVideoOptions} = variables;

  try {
    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    const uri = await interpolateVideo(
      {ai, ...aiVideoOptions},
      request.body as GenerateVideoFromFramesRequest);
    response.status(200).send(JSON.stringify({uri}));
  } catch (error) {
    console.error("Error generating video:", error);
    response.status(500).send("Error generating video");
    return;
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
 * @param {GenerateVideoRequest} imageParams    Generate Video from Frames Request
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
