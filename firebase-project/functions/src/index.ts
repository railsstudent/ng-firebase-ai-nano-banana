import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as express from "express";

setGlobalOptions({maxInstances: 2, region: "asia-east1"});

function validate(value: string | undefined, fieldName: string, response: express.Response) {
  const err = `${fieldName} is missing.`;
  if (!value) {
    logger.error(err);
    response.status(500).send(err);
  }

  return value;
}

function validateFirebaseConfigFields(env: NodeJS.ProcessEnv, response: express.Response) {
  const apiKey = validate(env.APP_API_KEY,"API Key", response);
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

  const recaptchaSiteKey = validate(env.RECAPTCHA_ENTERPRISE_SITE_KEY,"Recaptcha site key", response);
  if (!recaptchaSiteKey) {
    return undefined;
  }

  const strFirebaseConfig = validate(env.FIREBASE_CONFIG,"Firebase config", response);
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

export const getFirebaseConfig = onRequest( {cors: true}, (_, response) => {
  logger.info("getFirebaseConfig called");

  process.loadEnvFile();

  const variables = validateFirebaseConfigFields(process.env, response);
  if (!variables) {
    return;
  }

  const { recaptchaSiteKey, ...rest } = variables;
  const config = JSON.stringify({
    app: {
      ...rest,
      authDomain: `${rest.projectId}.firebaseapp.com`,
    },
    recaptchaSiteKey,
  });

  response.send(config);
});
