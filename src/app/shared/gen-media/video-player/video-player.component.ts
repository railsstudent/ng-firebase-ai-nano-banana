import { LoaderComponent } from '@/shared/loader/loader.component';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-video-player',
  imports: [LoaderComponent],
  template: `
@if (isGeneratingVideo()) {
  <div class="mt-6">
    <app-loader loadingText="Generating your video...">
      <p class="text-sm">This can take several minutes. Please be patient.</p>
    </app-loader>
  </div>
} @else if (videoUrl()) {
  <div class="mt-6 bg-gray-800 rounded-lg shadow-xl p-4">
    <video [src]="videoUrl()" controls autoplay loop class="w-full rounded-md"></video>
  </div>
}
  `,
  styleUrl: '../../tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent {
  isGeneratingVideo = input(false);
  videoUrl = input.required<string>();
}
