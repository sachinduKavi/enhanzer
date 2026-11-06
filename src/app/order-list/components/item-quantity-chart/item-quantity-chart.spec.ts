import { TestBed } from '@angular/core/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PurchaseOrder } from '../../order.model';
import { ItemQuantityChart } from './item-quantity-chart';

function order(id: number, items: [string, number][]): PurchaseOrder {
  return {
    id,
    createdAt: '2026-11-06T10:00:00',
    totalItems: items.length,
    totalQty: items.reduce((sum, [, qty]) => sum + qty, 0),
    items: items.map(([itemName, quantity], i) => ({
      id: id * 10 + i,
      itemName,
      quantity,
      price: 100,
      totalPrice: 100 * quantity,
    })),
  };
}

describe('ItemQuantityChart', () => {
  async function render(orders: PurchaseOrder[]): Promise<HTMLElement> {
    TestBed.configureTestingModule({ providers: [provideCharts(withDefaultRegisterables())] });
    const fixture = TestBed.createComponent(ItemQuantityChart);
    fixture.componentRef.setInput('orders', orders);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('groups quantities by item name across orders, largest first', async () => {
    const element = await render([
      order(1, [
        ['Mango', 10],
        ['Banana', 100],
      ]),
      order(2, [
        ['Mango', 15],
        ['Apple', 25],
      ]),
    ]);

    const rows = [...element.querySelectorAll('li')].map((li) =>
      [...li.querySelectorAll('span')].map((span) => span.textContent!.trim()).filter(Boolean),
    );

    expect(rows).toEqual([
      ['Banana', '100', '67%'],
      ['Mango', '25', '17%'],
      ['Apple', '25', '17%'],
    ]);
    expect(element.textContent).toContain('150');
  });

  it('shows a message when there is nothing to chart', async () => {
    const element = await render([]);

    expect(element.textContent).toContain('No items to chart yet.');
  });
});
