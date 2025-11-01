#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Data to be written to JSON file
const data = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const geminiModelName = process.env.GEMINI_MODEL_NAME;
if (!geminiModelName) {
  throw new ERROR('GEMINI_MODEL_NAME is not set.');
}

const geminiAPIKey = process.env.GEMINI_API_KEY;
if (!geminiAPIKey) {
  throw new ERROR('GEMINI_API_KEY is not set. Please create the key in Gemini AI Studio.');
}

const geminiVideoModelName = process.env.GEMINI_VIDEO_MODEL_NAME;
if (!geminiVideoModelName) {
  throw new ERROR('GEMINI_VEO_MODEL_NAME is not set.');
}

// Convert data to JSON string with indentation
const jsonString = JSON.stringify({
  app: data,
  geminiModelName,
  geminiAPIKey,
  geminiVideoModelName,
  poillingPeriod: +(process.env.VIDEO_POLLING_PERIOD || '10000'),
  is_veo31_used: process.env.IS_VEO31_USED === 'true',
}, null, 2);

// Define output file path
const outputPath = path.join('src','app', 'firebase-ai.json');

// Write JSON string to file
fs.writeFile(outputPath, jsonString, (err) => {
  if (err) {
    console.error('Error writing JSON file:', err);
    process.exit(1);
  }
  console.log(`JSON file has been saved to ${outputPath}`);
});
