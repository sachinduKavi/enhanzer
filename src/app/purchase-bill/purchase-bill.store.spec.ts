import { BillItem } from './purchase-bill.models';
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
  it('counts rows and sums Qty, not Free Qty', () => {
    const store = new PurchaseBillStore();

    store.add(row('Mango', 10));
    store.add(row('Apple', 5));

    expect(store.totalItems()).toBe(2);
    expect(store.totalQty()).toBe(15);
  });

  it('avoids floating point noise in the Qty total', () => {
    const store = new PurchaseBillStore();

    store.add(row('Mango', 0.1));
    store.add(row('Apple', 0.2));

    expect(store.totalQty()).toBe(0.3);
  });

  it('removes the row at the given position', () => {
    const store = new PurchaseBillStore();
    store.add(row('Mango', 10));
    store.add(row('Apple', 5));
    store.add(row('Kiwi', 2));

    store.remove(1);

    expect(store.items().map((item) => item.item)).toEqual(['Mango', 'Kiwi']);
    expect(store.totalQty()).toBe(12);
  });
});
