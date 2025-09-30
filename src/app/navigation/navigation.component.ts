import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChevronDownIconComponent } from './icons/chevron-down-icon.component';
import { HomeIconComponent } from './icons/home-icon.component';
import { PhotoIconComponent } from './icons/photo-icon.component';
import { FeatureService } from '../feature/services/feature.service';

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

  isDropdownOpen = signal(false);
  features = this.navigationService.getFeatures();

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }
}
