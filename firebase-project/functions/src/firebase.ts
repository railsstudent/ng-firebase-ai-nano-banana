/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import logger from "firebase-functions/logger";
import { validate } from "./validate";

/**
 *
 * @param {NodeJS.ProcessEnv} env         a dicitonary of environment variables
 * @return {object} an object containing validated environment variables or undefined if validation fails
 */
function validateFirebaseConfigFields(env: NodeJS.ProcessEnv) {
  const apiKey = validate(env.APP_API_KEY, "API Key");
  const appId = validate(env.APP_ID, "App Id");
  const messagingSenderId = validate(env.APP_MESSAGING_SENDER_ID, "Messaging Sender ID");
  const recaptchaSiteKey = validate(env.RECAPTCHA_ENTERPRISE_SITE_KEY, "Recaptcha site key");
  const strFirebaseConfig = validate(env.FIREBASE_CONFIG, "Firebase config");
  const firebaseConfig = JSON.parse(strFirebaseConfig);
  const projectId = validate(firebaseConfig?.projectId, "Project ID");
  const storageBucket = validate(firebaseConfig?.storageBucket, "Storage Bucket");

  return {
    apiKey,
    appId,
    recaptchaSiteKey,
    projectId,
    storageBucket,
    messagingSenderId,
  };
}

export const getFirebaseConfigFunction = () => {
  logger.info("getFirebaseConfig called");

  process.loadEnvFile();

  const variables = validateFirebaseConfigFields(process.env);
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

  return config;
};
