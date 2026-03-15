import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private orderedItems = 1; // TODO: replace with actual cart item count

  get hasItemsOrdered(): boolean {
    return this.orderedItems > 0;
  }
}
