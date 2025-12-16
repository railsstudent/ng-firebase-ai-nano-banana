import {onRequest} from "firebase-functions/https";
import {generateVideoFunction} from "./generate-video";
import {generateVideoFromFramesFunction} from "./interpolate-video-by-frames";

export const generateVideo = onRequest( {cors: true},
  (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    generateVideoFunction(request, response);
  }
);

export const interpolateVideo = onRequest( {cors: true},
  (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }
    generateVideoFromFramesFunction(request, response);
  }
);
