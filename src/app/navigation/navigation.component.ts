import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FeatureService } from '../feature/services/feature.service';
import { ChevronDownIconComponent, HomeIconComponent, PhotoIconComponent } from './icons/icons.component';

@Component({
  selector: 'app-navigation',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgComponentOutlet,
    HomeIconComponent,
    PhotoIconComponent,
    ChevronDownIconComponent,
  ],
  templateUrl: './navigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class NavigationComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly navigationService = inject(FeatureService);

  isPhotoDropdownOpen = signal(false);
  isModelingDropdownOpen = signal(false);
  features = this.navigationService.getPhotoEditItems();
  modelingFeatures = this.navigationService.getModelingItems();

  togglePhotoDropdown(): void {
    this.isPhotoDropdownOpen.update(v => !v);
  }

  toggleModelingDropdown(): void {
    this.isModelingDropdownOpen.update(v => !v);
  }

  onDocumentClick(event: MouseEvent): void {
    console.log(event.target);
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isPhotoDropdownOpen.set(false);
      this.isModelingDropdownOpen.set(false);
    }
  }
}
