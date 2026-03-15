import { Routes } from '@angular/router';
import { HomePage } from './pages/common/home-page/home-page';
import { WelcomePage } from './pages/customer/welcome-page/welcome-page';
import { OrderPage } from './pages/customer/order-page/order-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'customer/welcome',
    component: WelcomePage,
  },
  {
    path: 'customer/order',
    component: OrderPage,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
