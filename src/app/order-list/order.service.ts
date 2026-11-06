import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL, ApiResponse } from '../core/api/api';
import { PurchaseOrder } from './order.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  httpClient = inject(HttpClient);

  orderList: PurchaseOrder[] = [];

  loadOrders(): Observable<PurchaseOrder[]> {
    return this.httpClient
      .get<ApiResponse<PurchaseOrder[]>>(`${API_BASE_URL}/purchaseBill`)
      .pipe(map((response) => response.data));
  }
}
