import { Component } from '@angular/core';
import { Landing } from '../../../components/common/landing/landing';

@Component({
  selector: 'app-home-page',
  imports: [Landing],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.scss'],
})
export class HomePage {}
