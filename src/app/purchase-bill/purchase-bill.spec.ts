import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { LocationService } from '../core/location/location.service';
import { ItemEntryForm } from './components/item-entry-form/item-entry-form';
import { PurchaseBill } from './purchase-bill';

describe('PurchaseBill', () => {
  let fixture: ComponentFixture<PurchaseBill>;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: LocationService, useValue: { getLocations: () => of([]) } }],
    });
    fixture = TestBed.createComponent(PurchaseBill);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  function clickTab(name: string): Promise<void> {
    const tab = [...element.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
      (button) => button.textContent?.trim() === name,
    );
    tab!.click();
    return fixture.whenStable();
  }

  it('opens on the Details and Items tabs', () => {
    const selected = [...element.querySelectorAll('[aria-selected="true"]')].map((tab) =>
      tab.textContent?.trim(),
    );

    expect(element.querySelector('h1')?.textContent).toContain('Purchase Bill');
    expect(selected).toEqual(['Details', 'Items']);
  });

  function summaryValue(label: string): string | undefined {
    const row = [...element.querySelectorAll('app-summary-row')].find(
      (r) => r.querySelector('dt')?.textContent?.trim() === label,
    );
    return row?.querySelector('dd')?.textContent?.trim();
  }

  function tableRows(): string[] {
    return [...element.querySelectorAll('app-items-table tbody tr')].map((tr) =>
      tr.querySelector('td')!.textContent!.trim(),
    );
  }

  it('adds rows to the table and updates the item summary, and removes them', async () => {
    const form = fixture.debugElement.query(By.directive(ItemEntryForm))
      .componentInstance as ItemEntryForm;
    const batch = { locationCode: 'L1', locationName: 'Head Office' };
    const base = {
      batch,
      standardCost: 100,
      standardPrice: 150,
      margin: 50,
      freeQty: 1,
      discount: 0,
    };

    expect(tableRows()).toEqual(['No items added yet.']);

    form.itemAdded.emit({ ...base, item: 'Mango', qty: 10, totalCost: 1000, totalSelling: 1500 });
    form.itemAdded.emit({ ...base, item: 'Apple', qty: 5, totalCost: 500, totalSelling: 750 });
    await fixture.whenStable();

    expect(tableRows()).toEqual(['Mango', 'Apple']);
    expect(summaryValue('Total Items')).toBe('2');
    expect(summaryValue('Total Qty')).toBe('15');

    await clickTab('Notes');
    await clickTab('Details');
    expect(tableRows()).toEqual(['Mango', 'Apple']);

    element.querySelector<HTMLButtonElement>('[aria-label="Remove Mango"]')!.click();
    await fixture.whenStable();

    expect(tableRows()).toEqual(['Apple']);
    expect(summaryValue('Total Items')).toBe('1');
    expect(summaryValue('Total Qty')).toBe('5');
  });

  it('shows an empty message for tabs outside the item entry', async () => {
    await clickTab('Notes');

    expect(element.textContent).toContain('No notes for this bill.');
    expect(element.textContent).not.toContain('Accounts');
  });
});
