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
  const missingKeys: string[] = [];
  const apiKey = validate(env.APP_API_KEY, "API Key", missingKeys);
  const appId = validate(env.APP_ID, "App Id", missingKeys);
  const messagingSenderId = validate(env.APP_MESSAGING_SENDER_ID, "Messaging Sender ID", missingKeys);
  const recaptchaSiteKey = validate(env.RECAPTCHA_ENTERPRISE_SITE_KEY, "Recaptcha site key", missingKeys);
  const projectId = validate(env.GOOGLE_CLOUD_QUOTA_PROJECT, "Project ID", missingKeys);

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment variables: ${missingKeys.join(", ")}`);
  }

  return {
    app: {
      apiKey,
      appId,
      projectId,
      messagingSenderId,
      authDomain: `${projectId}.firebaseapp.com`,
      storageBucket: `${projectId}.firebasestorage.app`,
    },
    recaptchaSiteKey,
  };
}

export const getFirebaseConfigFunction = () => {
  logger.info("getFirebaseConfig called");

  process.loadEnvFile();

  const variables = validateFirebaseConfigFields(process.env);
  if (!variables) {
    return undefined;
  }

  return variables;
};
