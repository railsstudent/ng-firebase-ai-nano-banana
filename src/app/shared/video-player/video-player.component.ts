import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ErrorDisplayComponent } from '../error-display/error-display.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-video-player',
  imports: [LoaderComponent, ErrorDisplayComponent],
  template: `
@if (isGeneratingVideo()) {
  <div class="mt-6">
    <app-loader loadingText="Generating your video...">
      <p class="text-sm">This can take several minutes. Please be patient.</p>
    </app-loader>
  </div>
} @else if (videoUrl()) {
  <div class="mt-6 bg-gray-800 rounded-lg shadow-xl p-4">
    @if (showHeader()) {
      <h2 class="text-2xl font-bold text-white-400 mb-4">Your Generated Video</h2>
    }
    <video [src]="videoUrl()" controls autoplay loop class="w-full rounded-md"></video>
  </div>
}

<app-error-display [error]="videoError()" />
  `,
  styleUrl: '../tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent {
  showHeader = input(false);
  isGeneratingVideo = input(false);
  videoUrl = input.required<string>();
  videoError = input('');
}
