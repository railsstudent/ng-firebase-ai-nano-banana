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
  const strFirebaseConfig = validate(env.FIREBASE_CONFIG, "Firebase config", missingKeys);

  let projectId = "";
  let storageBucket = "";
  if (strFirebaseConfig) {
    const firebaseConfig = JSON.parse(strFirebaseConfig);

    projectId = validate(firebaseConfig?.projectId, "Project ID", missingKeys);
    storageBucket = validate(firebaseConfig?.storageBucket, "Storage Bucket", missingKeys);
  }

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment variables: ${missingKeys.join(", ")}`);
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

export const getFirebaseConfigFunction = () => {
  logger.info("getFirebaseConfig called");

  process.loadEnvFile();

  const variables = validateFirebaseConfigFields(process.env);
  if (!variables || !variables.projectId) {
    return undefined;
  }

  const { recaptchaSiteKey, ...rest } = variables;
  // Construct the Firebase config object
  const app = {
    ...rest,
    authDomain: `${rest.projectId}.firebaseapp.com`,
  };

  return {
    app,
    recaptchaSiteKey,
  };
};
