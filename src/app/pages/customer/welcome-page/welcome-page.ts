import { Component } from '@angular/core';
import { Landing } from '../../../components/common/landing/landing';
import { Button } from '../../../components/common/button/button';

@Component({
  selector: 'app-welcome-page',
  imports: [Landing, Button],
  templateUrl: './welcome-page.html',
  styleUrls: ['./welcome-page.scss'],
})
export class WelcomePage {}
