# Specification: Fix Grounding CSS Layout Conflict

## Problem Description

After upgrading Tailwind, the page layout on `http://localhost:4200/editor/create` gets halved (takes 50% width on the left, leaving the right side empty) after generating an image.

This issue only happens when Google Search Grounding is triggered (e.g. for prompts requesting factual data like "Find the latitude and longitude of China..."). The Gemini API response returns `renderedContents` (HTML containing Google Search Suggestions and a custom `<style>` block). This `<style>` block defines global CSS rules for a class named `.container`.

Because this HTML is injected into the page via `[innerHTML]`, the CSS rules leak out and override Tailwind CSS's global `.container` class (which is used to wrap the main layout in `app.component.ts`), causing the entire layout shell to shrink.

## Proposed Solution

In `GroundingComponent`, intercept `renderedContents` before sanitization and replace all references to `class="container"` and `.container` with a unique class name `class="google-container"` and `.google-container`. This isolates the search suggestions styling and prevents CSS style leakage.

## Implementation Details

### Refactor `GroundingComponent` (`src/app/shared/ui/gen-media/image-viewers/grounding/grounding.component.ts`)

Modify `safeRenderedContents` computation block:

```typescript
  safeRenderedContents = computed(() => {
    const unsafeContents = this.groundingMetadata()?.renderedContents || [];
    return unsafeContents.map((unsafeContent) => {
      const cleaned = unsafeContent
        .replace(/class=["']container["']/g, 'class="google-container"')
        .replace(/\.container\b/g, '.google-container');
      return this.sanitizer.bypassSecurityTrustHtml(cleaned);
    });
  });
```

---

## Action Item

1. Implement the change in `grounding.component.ts`.
2. Verify that `/editor/create` layout remains centered and full-width after factual image generation.
