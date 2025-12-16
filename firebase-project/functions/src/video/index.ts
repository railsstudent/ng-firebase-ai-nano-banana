import {onCall} from "firebase-functions/https";
import {generateVideoFunction} from "./generate-video";
import {generateVideoFromFramesFunction} from "./interpolate-video-by-frames";
import {GenerateVideoFromFramesRequest, GenerateVideoRequest} from "../types/video.type";

export const generateVideo = onCall( {cors: true, enforceAppCheck: true},
  ({data, app}) => {
    const videoRequest = data as GenerateVideoRequest;
    const appId = process.env?.APP_ID || "";
    if (app?.appId && app?.appId === appId) {
      return generateVideoFunction(videoRequest);
    }

    throw new Error("App Check failed");
  }
);

export const interpolateVideo = onCall( {cors: true, enforceAppCheck: true, timeoutSeconds: 180},
  ({data, app}) => {
    const videoRequest = data as GenerateVideoFromFramesRequest;
    const appId = process.env?.APP_ID || "";
    if (app?.appId && app?.appId === appId) {
      return generateVideoFromFramesFunction(videoRequest);
    }

    throw new Error("App Check failed");
  }
);
