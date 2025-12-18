/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {getFirebaseConfigFunction} from "./firebase";

process.loadEnvFile();

setGlobalOptions({maxInstances: 2, region: process.env.GOOGLE_FUNCTION_LOCATION || "us-central1"});

const cors = process.env.WHITELIST ? process.env.WHITELIST.split(',') : true;
const whitelist = process.env.WHITELIST?.split(",") || [];

export const getFirebaseConfig = onRequest( {cors},
  (request, response) => {
    if (request.method !== "GET") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const referer = request.header("referer");
      const origin = request.header("origin");
      if (!referer) {
        response.status(401).send("Unauthorized, invalid referer.");
        return;
      }

      if (!whitelist.includes(referer)) {
        response.status(401).send("Unauthorized, invalid referer.");
        return;
      }

      if (!origin) {
        response.status(401).send("Unauthorized, invalid origin.");
        return;
      }

      if (!whitelist.includes(origin)) {
        response.status(401).send("Unauthorized, invalid origin.");
        return;
      }

      getFirebaseConfigFunction(response);
    } catch (err) {
      console.error(err);
      response.status(401).send("Unauthorized");
    }
  }
);

// eslint-disable-next-line  @typescript-eslint/no-require-imports
exports.videos = require("./video");
