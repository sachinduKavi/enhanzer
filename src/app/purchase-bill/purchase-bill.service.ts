import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL, ApiResponse } from '../core/api/api';
import { BillItem } from './purchase-bill.models';

export interface SavedPurchaseBill {
  id: number;
  createdAt: string;
  totalItems: number;
  totalQty: number;
}

interface CreatePurchaseBillRequest {
  createdBy: string;
  items: {
    itemName: string;
    batchCode: string;
    standardCost: number;
    standardPrice: number;
    qty: number;
    freeQty: number;
    discount: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class PurchaseBillService {
  private readonly http = inject(HttpClient);

  // Only the entered values are sent; the backend recalculates margin and totals.
  save(createdBy: string, items: BillItem[]): Observable<SavedPurchaseBill> {
    const request: CreatePurchaseBillRequest = {
      createdBy,
      items: items.map((item) => ({
        itemName: item.item,
        batchCode: item.batch.locationCode,
        standardCost: item.standardCost,
        standardPrice: item.standardPrice,
        qty: item.qty,
        freeQty: item.freeQty,
        discount: item.discount,
      })),
    };

    return this.http
      .post<ApiResponse<SavedPurchaseBill>>(`${API_BASE_URL}/PurchaseBill`, request)
      .pipe(map((response) => response.data));
  }
}
