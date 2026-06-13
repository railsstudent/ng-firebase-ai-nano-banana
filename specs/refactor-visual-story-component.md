# Refactor Visual Story Component (Facade Pattern)

## Analysis

The Visual Story feature currently suffers from a fragmented architecture where state and orchestration logic are scattered across components and services. Passing `WritableSignal` into service methods is also an anti-pattern.

To adhere strictly to the **Single Responsibility Principle (SRP)**, we will use two separate Facades instead of a single monolithic one.

In this architecture:

* **Facades** manage State and UI Orchestration.
* **Services** manage Domain Logic and External API Communication.
* **Components** are ultra-thin "views" that inject Facades to map state to HTML and HTML events to Facade actions.

### 1. The Facades

* **`VisualStoryImageFacade`**: Responsible solely for the "storyboarding" aspect. It manages form state, creates step prompts, and tracks the generated images.
* **`VisualStoryVideoFacade`**: Responsible solely for video orchestration. It handles taking frames, generating videos, interpolating videos, extending videos, and managing the complex loading/error states associated with video generation.

### 2. The Services (Clarified Roles)

* **`GenVideoService`**: Remains the core API layer for video generation across the app. It will be cleaned up to remove `WritableSignal` parameters, returning pure `Promise<VideoGenerationResponse>` instead.
* **`VisualStoryService`**: Its pseudo-facade methods (like `interpolateVideo`) will be deleted. It will be reduced to handling pure, testable domain logic (e.g., `buildStepPrompts` and `buildStoryPrompt`).

## Implementation Plan

1. **Create `VisualStoryImageFacade`**:
   * Create `visual-story-image.facade.ts` in `src/app/features/visual-story/services/`.
   * Move the state: `visualStoryForm`, `genMediaInput`, and history-related logic.
   * Add a `generateImages()` method that orchestrates building prompts (via `VisualStoryService`) and updating the `genMediaInput` state.

2. **Create `VisualStoryVideoFacade`**:
   * Create `visual-story-video.facade.ts` in `src/app/features/visual-story/services/`.
   * Move the state: `videoResponse`, `isGeneratingVideo`, `loadingText`, `error`, and `extendVideoCounter`.
   * Add methods: `generateVideoFromFrames()` and `extendInterpolatedVideo()`, letting the facade manage the try/catch and loading/error states internally while calling `GenVideoService`.

3. **Refactor `VisualStoryService` & `GenVideoService`**:
   * Remove the `WritableSignal` parameters (`generatingSignal`, `error`) from `extendInterpolatedVideo` in both services.
   * Refactor them to simply return the Promise/Response.
   * Delete the middleman video methods from `VisualStoryService`.

4. **Refactor `VisualStoryComponent`**:
   * Inject `VisualStoryImageFacade`.
   * Remove local form state and logic.
   * Bind the HTML template directly to the Image Facade's state (e.g., `imageFacade.visualStoryForm()`).

5. **Refactor `VisualStoryVideoComponent`**:
   * Inject `VisualStoryVideoFacade`.
   * Keep the `images` and `userPrompt` inputs (passed down from `VisualStoryComponent`), but remove all local video state variables.
   * Bind its template to the Video Facade's state (e.g., `videoFacade.isGeneratingVideo()`, `videoFacade.videoUrl()`) and trigger Facade actions on click.

6. **Review and Verify**:
   * Ensure that the application builds successfully and that both domains (image storyboarding and video generation) function correctly in isolation.
