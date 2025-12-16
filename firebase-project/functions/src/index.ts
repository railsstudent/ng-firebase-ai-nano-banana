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

setGlobalOptions({maxInstances: 2, region: process.env.GOOGLE_FUNCTION_LOCATION || 'us-central1'});

export const getFirebaseConfig = onRequest( {cors: true},
  (request, response) => {
    if (request.method !== "GET") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    getFirebaseConfigFunction(response);
  }
);

exports.videos = require("./video");
