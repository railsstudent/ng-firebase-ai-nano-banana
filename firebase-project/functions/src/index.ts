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
import { getFirebaseConfigFunction } from './firebase';

setGlobalOptions({maxInstances: 2, region: "asia-east1"});

export const getFirebaseConfig = onRequest( {cors: true},
  (_, response) => getFirebaseConfigFunction(response)
);
