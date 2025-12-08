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
  private readonly featureService = inject(FeatureService);

  readonly navbars = this.featureService.getNavBars();
  navMenuState = signal(
    this.navbars.map((item) => ({ id: item.id, state: false }))
  );

  getNavMenuState(id: number) {
    return this.navMenuState().find((item) => item.id === id)?.state || false;
  }

  toggleDropdown(id: number): void {
    const state = this.getNavMenuState(id);
    this.navMenuState.update((items) => items.map((item) =>
      item.id === id ? ({ ...item, state: !state }) : item
    ));

    const newState = this.getNavMenuState(id);
    if (newState) {
      this.navMenuState.update((items) => items.map((item) => //{
        item.id !== id ? ({ ...item, state: false }) : item
      ));
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.navMenuState.update((items) => items.map((item) =>
        ({ ...item, state: false })
      ));
    }
  }
}
