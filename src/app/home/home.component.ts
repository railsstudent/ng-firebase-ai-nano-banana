import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../shared/card/card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CardComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
