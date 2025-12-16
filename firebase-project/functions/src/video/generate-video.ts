import {GoogleGenAI} from "@google/genai";
import express from "express";
import {AIVideoBucket, GenerateVideoRequest} from "../types/video.type";
import {generateVideoByPolling, validateVideoConfigFields} from "./video.util";


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

  const {genAIOptions, aiVideoOptions} = variables;

  try {
    // Video generation logic using Vertex AI would go here
    const ai = new GoogleGenAI(genAIOptions);
    const uri = await generateBase64Video({ai, ...aiVideoOptions}, request.body as GenerateVideoRequest);
    response.status(200).send(JSON.stringify({uri}));
  } catch (error) {
    console.error("Error generating video:", error);
    response.status(500).send("Error generating video");
    return;
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

/**
 *
 * @param {AIVideoBucket} aiVideo ai video bucket info
 * @param {GenerateVideoRequest} imageParams    Generate  Video Request
 * @return {string} video uri
 */
async function generateBase64Video(aiVideo: AIVideoBucket, imageParams: GenerateVideoRequest) {
  const args = constructVideoArguments(aiVideo.isVeo31Used, imageParams);
  return generateVideoByPolling(aiVideo, args);
}
