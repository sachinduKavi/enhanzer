import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../core/auth/auth.service';
import { LocationService } from '../core/location/location.service';
import { ItemEntryForm } from './components/item-entry-form/item-entry-form';
import { PurchaseBill } from './purchase-bill';
import { PurchaseBillService } from './purchase-bill.service';

describe('PurchaseBill', () => {
  let fixture: ComponentFixture<PurchaseBill>;
  let element: HTMLElement;
  const logout = vi.fn();

  beforeEach(async () => {
    logout.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: LocationService, useValue: { getLocations: () => of([]) } },
        {
          provide: PurchaseBillService,
          useValue: { save: () => of({ id: 12, createdAt: '', totalItems: 1, totalQty: 10 }) },
        },
        {
          provide: AuthService,
          useValue: {
            currentSession: signal({ email: 'user@example.com', displayName: 'User' }),
            logout,
          },
        },
        provideRouter([]),
      ],
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

  it('saves the bill from the header button and shows the bill number', async () => {
    const saveButton = element.querySelector<HTMLButtonElement>('[aria-label="Save bill"]')!;
    expect(saveButton.disabled).toBe(true);

    const form = fixture.debugElement.query(By.directive(ItemEntryForm))
      .componentInstance as ItemEntryForm;
    form.itemAdded.emit({
      item: 'Mango',
      batch: { locationCode: 'L1', locationName: 'Head Office' },
      standardCost: 100,
      standardPrice: 150,
      margin: 50,
      qty: 10,
      freeQty: 0,
      discount: 0,
      totalCost: 1000,
      totalSelling: 1500,
    });
    await fixture.whenStable();
    expect(saveButton.disabled).toBe(false);

    saveButton.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Purchase bill #12 saved with 1 item(s).',
    );
    expect(tableRows()).toEqual(['No items added yet.']);
  });

  it('clears the unsaved rows and the form with the reset button', async () => {
    const form = fixture.debugElement.query(By.directive(ItemEntryForm))
      .componentInstance as ItemEntryForm;
    const itemInput = element.querySelector<HTMLInputElement>('#bill-item')!;
    itemInput.value = 'Kiwi';
    itemInput.dispatchEvent(new Event('input'));
    form.itemAdded.emit({
      item: 'Mango',
      batch: { locationCode: 'L1', locationName: 'Head Office' },
      standardCost: 100,
      standardPrice: 150,
      margin: 50,
      qty: 10,
      freeQty: 0,
      discount: 0,
      totalCost: 1000,
      totalSelling: 1500,
    });
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('[aria-label="Reset"]')!.click();
    await fixture.whenStable();

    expect(tableRows()).toEqual(['No items added yet.']);
    expect(summaryValue('Total Items')).toBe('0');
    expect(itemInput.value).toBe('');
  });

  it('logs out and returns to the login page', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    element.querySelector<HTMLButtonElement>('[aria-label="Log out"]')!.click();

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('shows an empty message for tabs outside the item entry', async () => {
    await clickTab('Notes');

    expect(element.textContent).toContain('No notes for this bill.');
    expect(element.textContent).not.toContain('Accounts');
  });
});
