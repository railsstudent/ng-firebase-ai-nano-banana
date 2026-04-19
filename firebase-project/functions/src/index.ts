/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { getFirebaseConfigFunction } from "./firebase";

process.loadEnvFile();

setGlobalOptions({ maxInstances: 2, region: process.env.GOOGLE_FUNCTION_LOCATION || "us-central1" });

const splitList = (whitelist?: string) => (whitelist || '').split(",").map((origin) => origin.trim());

const whitelist = splitList(process.env.WHITELIST);
const cors = whitelist.length > 0 ? whitelist : true;
const refererList = splitList(process.env.REFERER);

export const getFirebaseConfig = onRequest( { cors },
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

      if (!refererList.includes(referer)) {
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

      const config = getFirebaseConfigFunction();

      response.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
      response.json(config);
    } catch (err) {
      console.error(err);
      response.status(401).send(err);
    }
  }
);

// eslint-disable-next-line  @typescript-eslint/no-require-imports
exports.videos = require("./video");
