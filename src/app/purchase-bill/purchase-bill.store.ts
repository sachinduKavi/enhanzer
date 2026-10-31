import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { BillItem } from './purchase-bill.models';
import { PurchaseBillService } from './purchase-bill.service';

export interface BillNotice {
  type: 'success' | 'error';
  message: string;
}

@Injectable()
export class PurchaseBillStore {
  private readonly purchaseBillService = inject(PurchaseBillService);
  private readonly authService = inject(AuthService);

  private readonly itemsState = signal<BillItem[]>([]);

  readonly items = this.itemsState.asReadonly();
  readonly totalItems = computed(() => this.items().length);
  readonly totalQty = computed(
    () => Math.round(this.items().reduce((sum, item) => sum + item.qty, 0) * 100) / 100,
  );
  readonly isSaving = signal(false);
  readonly notice = signal<BillNotice | null>(null);
  readonly canSave = computed(() => this.totalItems() > 0 && !this.isSaving());

  add(item: BillItem): void {
    this.itemsState.update((items) => [...items, item]);
    this.notice.set(null);
  }

  remove(index: number): void {
    this.itemsState.update((items) => items.filter((_, i) => i !== index));
  }

  reset(): void {
    this.itemsState.set([]);
    this.notice.set(null);
  }

  save(): void {
    const createdBy = this.authService.currentSession()?.email;
    if (!this.canSave() || !createdBy) {
      return;
    }

    this.isSaving.set(true);
    this.notice.set(null);

    this.purchaseBillService
      .save(createdBy, this.items())
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (bill) => {
          this.itemsState.set([]);
          this.notice.set({
            type: 'success',
            message: `Purchase bill #${bill.id} saved with ${bill.totalItems} item(s).`,
          });
        },
        error: (error: unknown) =>
          this.notice.set({ type: 'error', message: this.errorMessage(error) }),
      });
  }

  private errorMessage(error: unknown): string {
    const message = error instanceof HttpErrorResponse ? error.error?.message : null;
    return error instanceof HttpErrorResponse && error.status === 400 && typeof message === 'string'
      ? message
      : 'Could not save the bill. Please check your connection and try again.';
  }
}
