import { ChangeDetectionStrategy, Component, effect, output } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { ASPECT_RATIO_OPTIONS, RESOLUTION_OPTIONS } from './constants/generate-options.const';
import { GenerateOptionsModel } from './models/generate-options.model';
import { GenerateOptions } from './types/generate-options.type';

@Component({
  selector: 'app-generate-options-form',
  templateUrl: './generate-options-form.component.html',
  imports: [
    FormRoot,
    FormField,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateOptionsFormComponent {
  readonly aspectRatioOptions = ASPECT_RATIO_OPTIONS;

  readonly resolutionOptions = RESOLUTION_OPTIONS;

  generateConfigForm = form(GenerateOptionsModel);

  configValuesUpdated = output<GenerateOptions>();

  constructor() {
    effect(() => {
      if (this.generateConfigForm().valid()) {
        this.configValuesUpdated.emit(this.generateConfigForm().value());
      }
    });
  }
}
