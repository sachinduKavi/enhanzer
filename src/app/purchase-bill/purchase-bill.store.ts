import { computed, Injectable, signal } from '@angular/core';
import { BillItem } from './purchase-bill.models';

@Injectable()
export class PurchaseBillStore {
  private readonly itemsState = signal<BillItem[]>([]);

  readonly items = this.itemsState.asReadonly();
  readonly totalItems = computed(() => this.items().length);
  readonly totalQty = computed(
    () => Math.round(this.items().reduce((sum, item) => sum + item.qty, 0) * 100) / 100,
  );

  add(item: BillItem): void {
    this.itemsState.update((items) => [...items, item]);
  }

  remove(index: number): void {
    this.itemsState.update((items) => items.filter((_, i) => i !== index));
  }
}
