#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

process.loadEnvFile()

const geminiModelName = process.env.GEMINI_MODEL_NAME;
if (!geminiModelName) {
  throw new ERROR('GEMINI_MODEL_NAME is not set.');
}

const geminiVideoModelName = process.env.GEMINI_VIDEO_MODEL_NAME;
if (!geminiVideoModelName) {
  throw new ERROR('GEMINI_VEO_MODEL_NAME is not set.');
}

const jsonString = JSON.stringify({
  app: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },
  geminiModelName,
  geminiVideoModelName,
  poillingPeriod: +(process.env.VIDEO_POLLING_PERIOD || '10000'),
  is_veo31_used: process.env.IS_VEO31_USED === 'true',
  recaptchaEnterpriseSiteKey: process.env.RECAPTCHA_ENTERPRISE_SITE_KEY || '',
  vertexAILocation: process.env.VERTEX_AI_LOCATION
}, null, 2);

const outputPath = path.join('src','app', 'firebase.json');
fs.writeFileSync(outputPath, jsonString);
console.log(`JSON file has been saved to ${outputPath}`);
