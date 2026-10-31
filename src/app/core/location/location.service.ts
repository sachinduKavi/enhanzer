import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL, ApiResponse } from '../api/api';
import { UserLocation } from '../auth/auth.models';

export interface StoredLocation {
  locationCode: string;
  locationName: string;
}

interface CreateLocationsRequest {
  locations: {
    locationCode: string;
    locationName: string;
    stockHandle?: number;
    address?: string;
    phone?: string;
    status?: boolean;
  }[];
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);

  getLocations(): Observable<StoredLocation[]> {
    return this.http
      .get<ApiResponse<StoredLocation[]>>(`${API_BASE_URL}/Location`)
      .pipe(map((response) => response.data));
  }

  saveLocations(locations: UserLocation[]): Observable<void> {
    const request: CreateLocationsRequest = {
      locations: locations.map((location) => ({
        locationCode: location.Location_Code,
        locationName: location.Location_Name,
        stockHandle: location.Stock_Handle,
        address: location.Address,
        phone: location.Phone,
        status: location.Status === undefined ? undefined : location.Status === 1,
      })),
    };

    return this.http.post<ApiResponse>(`${API_BASE_URL}/Location`, request).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message ?? 'Failed to save locations.');
        }
      }),
    );
  }
}
