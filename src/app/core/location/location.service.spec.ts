import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api/api';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LocationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('posts the locations in the shape the backend expects', () => {
    service
      .saveLocations([
        {
          Location_Code: 'L1',
          Location_Name: 'Head Office',
          Stock_Handle: 1,
          Address: '',
          Phone: '',
          Status: 0,
        },
      ])
      .subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/Location`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      locations: [
        {
          locationCode: 'L1',
          locationName: 'Head Office',
          stockHandle: 1,
          address: '',
          phone: '',
          status: false,
        },
      ],
    });
    request.flush({ success: true, message: 'ok', data: null });
  });

  it('errors when the backend reports success: false', () => {
    let error: unknown;
    service.saveLocations([]).subscribe({ error: (e: unknown) => (error = e) });

    httpTesting
      .expectOne(`${API_BASE_URL}/Location`)
      .flush({ success: false, message: 'Database unavailable', data: null });

    expect((error as Error).message).toBe('Database unavailable');
  });
});
