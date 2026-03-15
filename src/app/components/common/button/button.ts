import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [NgClass, RouterLink],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class Button {
  @Input() type: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() disabled = false;
  @Input() routerLink: string | any[] | null = null;
  @Input() label = '';

  onClick() {
    console.log('Button clicked!');
  }
}
