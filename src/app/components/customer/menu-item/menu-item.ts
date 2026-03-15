import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu-item',
  imports: [],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.scss',
})
export class MenuItem {
  @Input() name!: string;
  @Input() description: string = '';
  @Input() imageSrc!: string;
  @Input() price!: number;
}
