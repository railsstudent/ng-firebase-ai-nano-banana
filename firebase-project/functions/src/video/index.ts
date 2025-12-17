import {onCall} from "firebase-functions/https";
import {generateVideoFunction} from "./generate-video";
import {generateVideoFromFramesFunction} from "./interpolate-video-by-frames";

const cors = process.env.WHITELIST ? process.env.WHITELIST : true;
const options = {
  cors,
  enforceAppCheck: true,
};

export const generateVideo = onCall( options,
  ({data}) => generateVideoFunction(data)
);

export const interpolateVideo = onCall( {...options, timeoutSeconds: 180},
  ({data}) => generateVideoFromFramesFunction(data)
);
