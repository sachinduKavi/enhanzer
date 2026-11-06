import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'purchase-bill',
    canActivate: [authGuard],
    loadComponent: () => import('./purchase-bill/purchase-bill').then((m) => m.PurchaseBill),
  },
  {
    path: 'order-list',
    canActivate: [authGuard],
    loadComponent: () => import('./order-list/orders').then((m) => m.OrderList),
  },
  { path: '**', redirectTo: 'login' },
];
