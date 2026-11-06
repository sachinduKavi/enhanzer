import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';
import { Icon } from '../shared/components/icon/icon';
import { PageHeader } from '../shared/components/page-header/page-header';
import { SummaryRow } from '../shared/components/summary-row/summary-row';
import { SummarySection } from '../shared/components/summary-section/summary-section';
import { ItemQuantityChart } from './components/item-quantity-chart/item-quantity-chart';
import { OrderService } from './order.service';
import { PurchaseOrder } from './order.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './orders.html',
  imports: [
    DatePipe,
    DecimalPipe,
    Icon,
    ItemQuantityChart,
    PageHeader,
    RouterLink,
    SummaryRow,
    SummarySection,
  ],
})
export class OrderList {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  orderService = inject(OrderService);

  orderlist = signal<PurchaseOrder[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  totalItems = computed(() => this.orderlist().reduce((sum, order) => sum + order.totalItems, 0));
  totalQty = computed(() => this.orderlist().reduce((sum, order) => sum + order.totalQty, 0));

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.status.set('loading');
    this.orderService.loadOrders().subscribe({
      next: (orders) => {
        this.orderlist.set(orders);
        this.status.set('loaded');
      },
      error: () => this.status.set('error'),
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
