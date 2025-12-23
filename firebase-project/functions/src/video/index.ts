import { onCall } from "firebase-functions/https";
import { generateVideoFunction } from "./generate-video";
import { generateVideoFromFramesFunction } from "./interpolate-video-by-frames";

const cors = process.env.WHITELIST ? process.env.WHITELIST.split(",") : true;
const options = {
  cors,
  enforceAppCheck: true,
  timeoutSeconds: 180,
};

export const generateVideo = onCall( options,
  ({ data }) => generateVideoFunction(data)
);

export const interpolateVideo = onCall( options,
  ({ data }) => generateVideoFromFramesFunction(data)
);
