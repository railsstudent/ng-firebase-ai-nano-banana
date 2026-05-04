import { ConfigService } from '@/ai/services/config.service';
import { FeatureDetails } from '@/feature/types/feature-details.type';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { GenMediaComponent } from '@/shared/gen-media/gen-media.component';
import { GenMediaInput } from '@/shared/gen-media/types/gen-media-input.type';
import { GenerateOptionsFormComponent } from '@/shared/generate-options-form/generate-options-form.component';
import { GenerateOptions } from '@/shared/generate-options-form/types/generate-options.type';
import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { getValue } from 'firebase/remote-config';

@Component({
  selector: 'app-predefined-prompt-editor',
  imports: [
    CardComponent,
    CardHeaderComponent,
    DropzoneComponent,
    ErrorDisplayComponent,
    SpinnerIconComponent,
    GenMediaComponent,
    GenerateOptionsFormComponent,
  ],
  templateUrl: './predefined-prompt-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PredefinedPromptComponent {
  featureId = input.required<string>();
  feature = input.required<FeatureDetails>();

  configService = inject(ConfigService);

  imageFiles = signal<File[]>([]);

  customPrompt = computed(() => this.feature().customPrompt || '');
  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  templateId = linkedSignal({
    source: () => ({
      remoteConfig: this.configService.firebaseObjects?.remoteConfig,
      templateConfigName: this.feature().templateConfigName,
    }),
    computation: ({ remoteConfig, templateConfigName }) => {
      if (remoteConfig && templateConfigName) {
        const templateId = getValue(remoteConfig, templateConfigName).asString();
        return templateId;
      }
      return undefined;
    }
  });

  genMediaInput = signal<GenMediaInput>({
    userPrompt: '',
    prompts: undefined,
    imageFiles: [],
    templateParam: undefined,
  });

  genmedia = viewChild<GenMediaComponent>('genmedia');
  isLoading = computed(() => this.genmedia()?.isLoading() || false);
  isDisabled = computed(() =>{
    const isGeneratingVideo = this.genmedia()?.isGeneratingVideo() || false;
    return this.isLoading() || !this.imageFiles().length || isGeneratingVideo;
  })
  error = computed(() => this.genmedia()?.error() || '');

  genConfigValues = signal<GenerateOptions | undefined>(undefined);

  async handleGenerate(event: Event): Promise<void> {
    event.preventDefault();

    let userPrompt = this.customPrompt().trim();
    const aspectRatio = this.genConfigValues()?.aspectRatio || '';
    const resolution = this.genConfigValues()?.resolution || '';
    if (userPrompt) {

      if (aspectRatio) {
        userPrompt = `${userPrompt}\Apply this aspect ratio to the image: ${aspectRatio}`;
      }

      if (resolution) {
        userPrompt = `${userPrompt}\nApply this resolution to the image: ${resolution}`;
      }
    }

    this.genMediaInput.set({
      userPrompt,
      prompts: undefined,
      imageFiles: this.imageFiles(),
      templateParam: {
        templateId: this.templateId(),
        aspectRatio,
        resolution
      },
    });
  }
}
