import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LocationService, StoredLocation } from '../../../core/location/location.service';
import { BillItem } from '../../purchase-bill.models';
import { ItemEntryForm } from './item-entry-form';

describe('ItemEntryForm', () => {
  let fixture: ComponentFixture<ItemEntryForm>;
  let element: HTMLElement;
  const getLocations = vi.fn<() => Observable<StoredLocation[]>>();
  const headOffice: StoredLocation = { locationCode: 'L1', locationName: 'Head Office' };

  async function create(): Promise<void> {
    TestBed.configureTestingModule({
      providers: [{ provide: LocationService, useValue: { getLocations } }],
    });
    fixture = TestBed.createComponent(ItemEntryForm);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function setValue(id: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function selectBatch(index: number): void {
    const select = element.querySelector<HTMLSelectElement>('#bill-batch')!;
    select.selectedIndex = index;
    select.dispatchEvent(new Event('change'));
  }

  function readonlyValue(id: string): string {
    return element.querySelector<HTMLInputElement>(`#${id}`)!.value;
  }

  async function submit(): Promise<void> {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  beforeEach(() => {
    getLocations.mockReset().mockReturnValue(of([headOffice]));
  });

  it('lists the saved locations as batches', async () => {
    await create();

    const labels = [...element.querySelectorAll('#bill-batch option')].map((o) =>
      o.textContent!.trim(),
    );
    expect(labels).toEqual(['Select a batch', 'Head Office']);
  });

  it('calculates margin, total cost and total selling as values are entered', async () => {
    await create();

    setValue('bill-cost', '100');
    setValue('bill-price', '150');
    setValue('bill-qty', '5');
    setValue('bill-discount', '20');
    await fixture.whenStable();

    expect(readonlyValue('bill-margin')).toBe('50.00');
    expect(readonlyValue('bill-total-cost')).toBe('400.00');
    expect(readonlyValue('bill-total-selling')).toBe('750.00');
  });

  it('shows validation messages and does not add an invalid row', async () => {
    await create();
    const added = vi.fn();
    fixture.componentInstance.itemAdded.subscribe(added);

    setValue('bill-item', 'Pineapple');
    setValue('bill-qty', '0');
    setValue('bill-discount', '150');
    await submit();

    const errors = Object.fromEntries(
      [...element.querySelectorAll('app-form-field')].map((field) => [
        field.querySelector('label')!.textContent!.replace('*', '').trim(),
        field.querySelector('[aria-live]')!.textContent!.trim(),
      ]),
    );
    expect(errors).toMatchObject({
      Item: 'Pick from the list',
      Batch: 'Required',
      'Standard Cost': 'Required',
      'Standard Price': 'Required',
      Qty: 'Must be > 0',
      'Discount (%)': 'Must be ≤ 100',
    });
    expect(added).not.toHaveBeenCalled();
  });

  it('emits a complete row and clears the form when valid', async () => {
    await create();
    let added: BillItem | undefined;
    fixture.componentInstance.itemAdded.subscribe((item) => (added = item));

    setValue('bill-item', 'Mango');
    selectBatch(1);
    setValue('bill-cost', '100');
    setValue('bill-price', '150');
    setValue('bill-qty', '5');
    setValue('bill-discount', '20');
    await fixture.whenStable();
    await submit();

    expect(added).toEqual({
      item: 'Mango',
      batch: headOffice,
      standardCost: 100,
      standardPrice: 150,
      margin: 50,
      qty: 5,
      freeQty: 0,
      discount: 20,
      totalCost: 400,
      totalSelling: 750,
    });
    expect(element.querySelector<HTMLInputElement>('#bill-item')!.value).toBe('');
    expect(readonlyValue('bill-total-cost')).toBe('');
  });

  it('offers a retry when batches fail to load', async () => {
    getLocations.mockReturnValueOnce(throwError(() => new Error('offline')));
    await create();

    expect(element.textContent).toContain("Couldn't load batches.");

    [...element.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Retry')!.click();
    await fixture.whenStable();

    expect(getLocations).toHaveBeenCalledTimes(2);
    expect(element.textContent).not.toContain("Couldn't load batches.");
  });
});
