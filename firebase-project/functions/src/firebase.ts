/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import logger from "firebase-functions/logger";
import express from "express";
import { validate } from "./validate";

/**
 *
 * @param {NodeJS.ProcessEnv} env         a dicitonary of environment variables
 * @param {express.Response} response    express response object
 * @return {object} an object containing validated environment variables or undefined if validation fails
 */
function validateFirebaseConfigFields(env: NodeJS.ProcessEnv, response: express.Response) {
  const apiKey = validate(env.APP_API_KEY, "API Key", response);
  if (!apiKey) {
    return undefined;
  }

  const appId = validate(env.APP_ID, "App Id", response);
  if (!appId) {
    return undefined;
  }

  const messagingSenderId = validate(env.APP_MESSAGING_SENDER_ID, "Messaging Sender ID", response);
  if (!messagingSenderId) {
    return undefined;
  }

  const recaptchaSiteKey = validate(env.RECAPTCHA_ENTERPRISE_SITE_KEY, "Recaptcha site key", response);
  if (!recaptchaSiteKey) {
    return undefined;
  }

  const strFirebaseConfig = validate(env.FIREBASE_CONFIG, "Firebase config", response);
  if (!strFirebaseConfig) {
    return undefined;
  }

  const firebaseConfig = JSON.parse(strFirebaseConfig);
  const projectId = validate(firebaseConfig?.projectId, "Project ID", response);
  if (!projectId) {
    return undefined;
  }

  const storageBucket = validate(firebaseConfig?.storageBucket, "Storage Bucket", response);
  if (!storageBucket) {
    return undefined;
  }

  return {
    apiKey,
    appId,
    recaptchaSiteKey,
    projectId,
    storageBucket,
    messagingSenderId,
  };
}

export const getFirebaseConfigFunction = (response: express.Response) => {
  logger.info("getFirebaseConfig called");

  process.loadEnvFile();

  const variables = validateFirebaseConfigFields(process.env, response);
  if (!variables) {
    return;
  }

  const { recaptchaSiteKey, ...rest } = variables;
  // Construct the Firebase config object
  const app = {
    ...rest,
    authDomain: `${rest.projectId}.firebaseapp.com`,
  };
  const config = JSON.stringify({
    app,
    recaptchaSiteKey,
  });

  response.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  response.send(config);
};
