# [COMPLETED] Refactoring Video Polling Functions

## Objective
Refactor `@firebase-project/functions/src/video/video.util.ts` to eliminate code duplication between `generateVideoByPolling` and `extendVideoByPolling`.

## Status: DONE
The refactor has been implemented and verified with a successful build.

## Implementation Details
1. **Generic Helper:** Created a private `processVideoPolling` function that handles the common logic.
2. **Type Alias:** Introduced `VideoMediaParams` for better readability.
3. **Wrappers:** Refactored `generateVideoByPolling` and `extendVideoByPolling` to serve as thin mapping layers.
4. **Verification:** Confirmed success via `npm run build`.

## Analysis (Historical)
...

Based on the provided codebase, `generateVideoByPolling` and `extendVideoByPolling` have nearly identical implementations. They both:

1. Extract variables from the `AIVideoBucket` object.
2. Construct a `GenerateVideosParameters` payload.
3. Call the `getVideoUri` function.

The only difference is that `generateVideoByPolling` injects an `image` property into the payload, whereas `extendVideoByPolling` injects a `video` property.

## Proposed Plan

**Step 1: Extract a Generic Helper in `video.util.ts`**
Define a type alias for the required video parameters and create a single private function, `processVideoPolling`.

```typescript
type VideoMediaParams = Pick<GenerateVideosParameters, "image" | "video" | "prompt" | "config">;

async function processVideoPolling(
  { ai, model, storageBucket, pollingPeriod }: AIVideoBucket,
  mediaParams: VideoMediaParams
) {
  const genVideosParams: GenerateVideosParameters = {
    model,
    ...mediaParams,
    config: {
      ...mediaParams.config,
      numberOfVideos: 1,
      outputGcsUri: `gs://${storageBucket}`,
    },
  };

  return getVideoUri(ai, genVideosParams, pollingPeriod);
}
```

**Step 2: Update Exported Functions in `video.util.ts`**
Refactor the existing `generateVideoByPolling` and `extendVideoByPolling` functions to act as lightweight wrappers around the new `processVideoPolling` helper. This approach keeps the call signatures the same, meaning no other files in the project need to be updated.

```typescript
export async function generateVideoByPolling(
  aiVideo: AIVideoBucket,
  request: GenerateVideoRequest,
) {
  return processVideoPolling(aiVideo, {
    prompt: request.prompt,
    config: request.config,
    image: {
      imageBytes: request.imageBytes,
      mimeType: request.mimeType,
    },
  });
}

export async function extendVideoByPolling(
  aiVideo: AIVideoBucket,
  request: ExtendVideoRequest,
) {
  return processVideoPolling(aiVideo, {
    prompt: request.prompt,
    config: request.config,
    video: request.video,
  });
}
```

**Step 3: Verification**
Verify that TypeScript compiles correctly and that no required parameters are missing in the refactored wrappers.

---
*Please approve this plan or specify if you would rather replace the wrappers entirely and update all calling files.*
