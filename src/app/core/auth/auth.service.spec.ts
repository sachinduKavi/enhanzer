import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LocationService } from '../location/location.service';
import { InvalidCredentialsError, LoginResponse, UserLocation } from './auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  const saveLocations = vi.fn<(locations: UserLocation[]) => Observable<void>>();

  const locations: UserLocation[] = [{ Location_Code: 'L1', Location_Name: 'Head Office' }];
  const successResponse: LoginResponse = {
    Status_Code: 200,
    Message: '',
    Response_Body: [
      { Email: 'user@example.com', User_Display_Name: 'Test User', User_Locations: locations },
    ],
  };

  beforeEach(() => {
    sessionStorage.clear();
    saveLocations.mockReset().mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LocationService, useValue: { saveLocations } },
      ],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  function flushLogin(response: LoginResponse): { error?: unknown } {
    const result: { error?: unknown } = {};
    service.login('user@example.com', 'secret').subscribe({
      error: (error: unknown) => (result.error = error),
    });
    httpTesting.expectOne(() => true).flush(response);
    return result;
  }

  it('sends the email as Company_Code and Username, and the password as Pw', () => {
    service.login('user@example.com', 'secret').subscribe({ error: () => undefined });

    const request = httpTesting.expectOne(() => true);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      API_Action: 'GetLoginData',
      Device_Id: 'D001',
      Sync_Time: '',
      Company_Code: 'user@example.com',
      API_Body: { Username: 'user@example.com', Pw: 'secret' },
    });
    request.flush({ Status_Code: 401, Message: '', Response_Body: null });
  });

  it('saves the locations, then stores a session without the password', () => {
    flushLogin(successResponse);

    expect(saveLocations).toHaveBeenCalledWith(locations);
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem('enhanzer.session')).not.toContain('secret');
  });

  it('does not sign in when saving the locations fails', () => {
    saveLocations.mockReturnValue(throwError(() => new Error('Failed to save locations.')));

    const { error } = flushLogin(successResponse);

    expect(error).toBeInstanceOf(Error);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('rejects a wrong password, which the API reports with Status_Code 200', () => {
    const { error } = flushLogin({
      Status_Code: 200,
      Message: '',
      Response_Body: [{ Email: 'user@example.com', Doc_Msg: 'Invalid Login Details' }],
    });

    expect(error).toBeInstanceOf(InvalidCredentialsError);
    expect(saveLocations).not.toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('rejects an unknown user, which the API reports with a null body', () => {
    const { error } = flushLogin({ Status_Code: 401, Message: '', Response_Body: null });

    expect(error).toBeInstanceOf(InvalidCredentialsError);
    expect(service.isAuthenticated()).toBe(false);
  });
});
