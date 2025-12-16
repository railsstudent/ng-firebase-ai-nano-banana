import {onCall} from "firebase-functions/https";
import {generateVideoFunction} from "./generate-video";
import {generateVideoFromFramesFunction} from "./interpolate-video-by-frames";

export const generateVideo = onCall( {cors: true, enforceAppCheck: true},
  ({data}) => generateVideoFunction(data)
);

export const interpolateVideo = onCall( {cors: true, enforceAppCheck: true, timeoutSeconds: 180},
  ({data}) => generateVideoFromFramesFunction(data)
);
