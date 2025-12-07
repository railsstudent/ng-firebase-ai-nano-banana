#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

process.loadEnvFile()

const jsonString = JSON.stringify({
  app: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },
  recaptchaEnterpriseSiteKey: process.env.RECAPTCHA_ENTERPRISE_SITE_KEY || '',
}, null, 2);

const outputPath = path.join('src','app', 'firebase.json');
fs.writeFileSync(outputPath, jsonString);
console.log(`JSON file has been saved to ${outputPath}`);
