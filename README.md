# AI Nano Banana - Generative AI with Angular & Firebase

This project demonstrates a Generative AI application built with **Angular** and **Firebase**, leveraging **Google Cloud Vertex AI** for image and video generation. It features a conversational interface to generate media using Gemini and Veo models.

## 🏗️ Architecture

The application follows a modern serverless architecture:

* **Frontend:** Angular (v21) standalone components, providing a rich, responsive UI.
* **Backend:** Firebase Functions (V2) for secure server-side logic and API integrations.
* **AI Integration:**
  * **Firebase AI Logic (Gemini):** Used for conversational AI and generating images that are returned immediately to the Angular client.
  * **Veo (Vertex AI):** Used for advanced video generation (Veo 3.1), invoked through Firebase Functions.
* **Storage:** Firebase Storage is used specifically for hosting the generated Veo videos.
* **Configuration:** Firebase Remote Config for dynamic application settings.

## 🛠️ Tech Stack

* **Framework:** Angular 21
* **Language:** TypeScript
* **Styling:** CSS (with Tailwind CSS utilities)
* **Backend Services:** Firebase (Functions, Storage, Remote Config, AI Logic)
* **AI Models:**
  * `gemini-3.1-flash-image-preview` (Nano Banana 2 for Image Generation)
  * `veo-3.1-lite-generate-001` (Video Generation)
* **Cloud Platform:** Google Cloud (Vertex AI)

## ⚙️ Configuration Details

* **Google Cloud Project ID:** `vertexai-firebase-6a64f`
* **Global Location / Region:** `us-central1`
* **Firebase API Key:** (Configured in Firebase environment)

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS version)
* Firebase CLI (`npm install -g firebase-tools`)
* Angular CLI (`npm install -g @angular/cli`)

### Setup

1. **Clone the repository.**
2. **Install dependencies:**

    ```bash
    npm install
    cd firebase-project/functions
    npm install
    cd ../..
    ```

3. **Environment Variables:**
    Create a `.env` file in `firebase-project/functions/` based on `.env.example`:

    ```env
    GOOGLE_CLOUD_LOCATION="us-central1"
    GOOGLE_FUNCTION_LOCATION="us-central1"
    GEMINI_VIDEO_MODEL_NAME="veo-3.1-lite-generate-001"
    WHITELIST="http://localhost:4200"
    REFERER="http://localhost:4200/"
    ```

### Running the Application

To run the application locally with full functionality:

1. **Start Firebase Emulators:**
    ```bash
    cd firebase-project/functions
    npm run serve
    ```
    This will build the functions and start the Functions emulator.

2. **Start Angular Development Server:**
    In the root directory, run:
    ```bash
    npm start
    ```
    Open your browser at `http://localhost:4200`.

## 🧪 Deployment

To deploy the backend services to Firebase, navigate to the functions directory and use the provided npm scripts:

```bash
cd firebase-project/functions

# Deploy Firebase Functions
npm run deploy

# Deploy Firebase Storage Rules
npm run deploy:storage
```
