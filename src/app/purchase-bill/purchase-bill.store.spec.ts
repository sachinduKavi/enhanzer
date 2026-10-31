import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../core/auth/auth.service';
import { BillItem } from './purchase-bill.models';
import { PurchaseBillService, SavedPurchaseBill } from './purchase-bill.service';
import { PurchaseBillStore } from './purchase-bill.store';

function row(item: string, qty: number): BillItem {
  return {
    item,
    batch: { locationCode: 'L1', locationName: 'Head Office' },
    standardCost: 100,
    standardPrice: 150,
    margin: 50,
    qty,
    freeQty: 1,
    discount: 0,
    totalCost: 100 * qty,
    totalSelling: 150 * qty,
  };
}

describe('PurchaseBillStore', () => {
  let store: PurchaseBillStore;
  const save = vi.fn<(createdBy: string, items: BillItem[]) => Observable<SavedPurchaseBill>>();

  beforeEach(() => {
    save.mockReset();
    TestBed.configureTestingModule({
      providers: [
        PurchaseBillStore,
        { provide: PurchaseBillService, useValue: { save } },
        {
          provide: AuthService,
          useValue: { currentSession: signal({ email: 'user@example.com', displayName: 'User' }) },
        },
      ],
    });
    store = TestBed.inject(PurchaseBillStore);
  });

  it('counts rows and sums Qty, not Free Qty', () => {
    store.add(row('Mango', 10));
    store.add(row('Apple', 5));

    expect(store.totalItems()).toBe(2);
    expect(store.totalQty()).toBe(15);
  });

  it('avoids floating point noise in the Qty total', () => {
    store.add(row('Mango', 0.1));
    store.add(row('Apple', 0.2));

    expect(store.totalQty()).toBe(0.3);
  });

  it('removes the row at the given position', () => {
    store.add(row('Mango', 10));
    store.add(row('Apple', 5));
    store.add(row('Kiwi', 2));

    store.remove(1);

    expect(store.items().map((item) => item.item)).toEqual(['Mango', 'Kiwi']);
    expect(store.totalQty()).toBe(12);
  });

  it('cannot save an empty bill', () => {
    store.save();

    expect(store.canSave()).toBe(false);
    expect(save).not.toHaveBeenCalled();
  });

  it('saves as the logged-in user, then clears the rows and reports the bill number', () => {
    const response = new Subject<SavedPurchaseBill>();
    save.mockReturnValue(response);
    store.add(row('Mango', 10));

    store.save();

    expect(save).toHaveBeenCalledWith('user@example.com', [row('Mango', 10)]);
    expect(store.isSaving()).toBe(true);
    expect(store.canSave()).toBe(false);

    response.next({ id: 7, createdAt: '', totalItems: 1, totalQty: 10 });
    response.complete();

    expect(store.isSaving()).toBe(false);
    expect(store.items()).toEqual([]);
    expect(store.notice()).toEqual({
      type: 'success',
      message: 'Purchase bill #7 saved with 1 item(s).',
    });
  });

  it('keeps the rows and shows the backend message when the bill is rejected', () => {
    save.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { success: false, message: 'Unknown batch: L1.', data: null },
          }),
      ),
    );
    store.add(row('Mango', 10));

    store.save();

    expect(store.items()).toHaveLength(1);
    expect(store.notice()).toEqual({ type: 'error', message: 'Unknown batch: L1.' });
  });

  it('shows a generic message when the backend cannot be reached', () => {
    save.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    store.add(row('Mango', 10));

    store.save();

    expect(store.notice()?.message).toContain('Could not save the bill.');
    expect(store.items()).toHaveLength(1);
  });

  it('clears the previous notice when a new row is added', () => {
    save.mockReturnValue(of({ id: 1, createdAt: '', totalItems: 1, totalQty: 10 }));
    store.add(row('Mango', 10));
    store.save();

    store.add(row('Apple', 5));

    expect(store.notice()).toBeNull();
  });
});
