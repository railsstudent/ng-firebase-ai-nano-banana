# Firebase CLI

## Install firebase tools

```bash
npm install -g firebase-tools
```

## Firebase Authentication

```bash
firebase logout
firebase login 
```

## Start Firebase Emulator Suite

- Storage Emulator requires Java 21 or above.

- Connect to the Cloud Storage for Firebase emulator when the FIREBASE_STORAGE_EMULATOR_HOST environment variable is set:

```bash
export FIREBASE_STORAGE_EMULATOR_HOST="127.0.0.1:9199"
```

```bash
cd functions
npm run serve  # start Functions and Storage emulator
```

Once the Firebase Emulator Suite is running, open your browser and navigate to `http://127.0.0.1:4000/` to try the emulators.
