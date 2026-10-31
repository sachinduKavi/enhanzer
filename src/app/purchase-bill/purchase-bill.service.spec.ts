import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api/api';
import { PurchaseBillService } from './purchase-bill.service';

describe('PurchaseBillService', () => {
  it('posts only the entered values and returns the saved bill', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const httpTesting = TestBed.inject(HttpTestingController);
    let saved: unknown;

    TestBed.inject(PurchaseBillService)
      .save('user@example.com', [
        {
          item: 'Mango',
          batch: { locationCode: 'L1', locationName: 'Head Office' },
          standardCost: 100,
          standardPrice: 150,
          margin: 50,
          qty: 5,
          freeQty: 1,
          discount: 20,
          totalCost: 400,
          totalSelling: 750,
        },
      ])
      .subscribe((bill) => (saved = bill));

    const request = httpTesting.expectOne(`${API_BASE_URL}/PurchaseBill`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      createdBy: 'user@example.com',
      items: [
        {
          itemName: 'Mango',
          batchCode: 'L1',
          standardCost: 100,
          standardPrice: 150,
          qty: 5,
          freeQty: 1,
          discount: 20,
        },
      ],
    });

    const bill = { id: 3, createdAt: '2026-10-31T00:00:00Z', totalItems: 1, totalQty: 5 };
    request.flush({ success: true, message: 'saved', data: bill });

    expect(saved).toEqual(bill);
    httpTesting.verify();
  });
});
