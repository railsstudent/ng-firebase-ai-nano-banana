# NgFirebaseAiNanoBanana

## Firebase AI Logic Setup

- Set up a new project in Firebase Console [https://console.firebase.google.com/](https://console.firebase.google.com/)  

- Enable Gemini API and Vertex AI
- Enable AI Monitoring
- Add Firebase AI Logic Web App to the project.
- Copy the configuration of the firebase app to the `.env` file.

## Environment Setup

- Copy `.env.example` to `.env`
- Replace the placeholders with the Firebase AI Logic configuration

## Generate a Firebase Configuration and Start Server

```bash
chmod a+x ./cli.js
npm start
```

- Run the script to generate the Firebase configuration object in the `src/app/firebase-ai.json` file.
- The server runs at `http://localhost:4200/`. 

- Start the server

## Development server

Perform a one-off operation to generate the Firebase configuration object.

```bash
chmod a+x ./cli.js
node ./cli.js
```

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Production Build

```bash
npm run build
serve dist
```

Once the server is running, open your browser and navigate to `http://localhost:3000/` to try the production build.
