import { LoaderComponent } from '@/shared/loader/loader.component';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ExtendVideoIconComponent } from '../../icons/extend-video-icon.component';

@Component({
  selector: 'app-video-player',
  imports: [LoaderComponent, ExtendVideoIconComponent],
  template: `
@if (isGeneratingVideo()) {
  <div class="mt-6">
    <app-loader loadingText="loadingText()">
      <p class="text-sm">This can take several minutes. Please be patient.</p>
    </app-loader>
  </div>
} @else if (videoUrl()) {
  <div class="mt-6 flex flex-col gap-4">
    <div class="video-container">
      <video [src]="videoUrl()" controls autoplay loop class="w-full rounded-md"></video>
    </div>

    <div class="flex justify-center">
      <button
        (click)="extendVideo.emit()"
        aria-label="Extend video"
        title="Extend video"
        class="extend-btn"
      >
        <app-extend-video-icon />
        <span>Extend Video</span>
      </button>
    </div>
  </div>
}
  `,
  styleUrl: './video-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent {
  isGeneratingVideo = input(false);
  videoUrl = input.required<string>();
  extendVideo = output<void>();

  loadingText = input('Generating your video...');
}
