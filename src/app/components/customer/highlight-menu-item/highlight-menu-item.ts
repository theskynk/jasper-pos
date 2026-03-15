import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-highlight-menu-item',
  imports: [],
  templateUrl: './highlight-menu-item.html',
  styleUrl: './highlight-menu-item.scss',
})
export class HighlightMenuItem {
  @Input() name!: string;
  @Input() description: string = '';
  @Input() imageSrc!: string;
  @Input() price!: number;
}
