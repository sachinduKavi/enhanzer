import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LocationService } from '../core/location/location.service';
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

  it('shows an empty message for tabs outside the item entry', async () => {
    await clickTab('Notes');

    expect(element.textContent).toContain('No notes for this bill.');
    expect(element.textContent).not.toContain('Accounts');
  });
});
