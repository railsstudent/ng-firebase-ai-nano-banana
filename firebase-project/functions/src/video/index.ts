import { onCall } from "firebase-functions/v2/https";
import { extendVideoFunction } from "./extend-video";
import { generateVideoFunction } from "./generate-video";
import { generateVideoFromFramesFunction } from "./interpolate-video-by-frames";

const cors = process.env.WHITELIST ? process.env.WHITELIST.split(",") : true;
const options = {
  cors,
  enforceAppCheck: true,
  timeoutSeconds: 600,
};

export const generateVideo = onCall( options,
  ({ data }) => generateVideoFunction(data)
);

export const interpolateVideo = onCall( options,
  ({ data }) => generateVideoFromFramesFunction(data)
);

export const extendVideo = onCall( options,
  ({ data }) => extendVideoFunction(data)
);
