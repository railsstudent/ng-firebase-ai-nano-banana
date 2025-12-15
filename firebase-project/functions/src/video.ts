import {onRequest} from "firebase-functions/https";
import {generateVideoFunction} from "./generate-video";

export const generateVideo = onRequest( {cors: true},
  (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    generateVideoFunction(request, response);
  }
);
