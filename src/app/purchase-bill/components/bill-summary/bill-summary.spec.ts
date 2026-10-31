import { TestBed } from '@angular/core/testing';
import { BillSummary } from './bill-summary';

describe('BillSummary', () => {
  it('shows the item totals', async () => {
    const fixture = TestBed.createComponent(BillSummary);
    fixture.componentRef.setInput('totalItems', 2);
    fixture.componentRef.setInput('totalQty', 1500);
    await fixture.whenStable();

    const rows = [...fixture.nativeElement.querySelectorAll('app-summary-row')].map(
      (row: HTMLElement) => row.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(rows).toContain('Total Items 2');
    expect(rows).toContain('Total Qty 1,500');
  });
});
