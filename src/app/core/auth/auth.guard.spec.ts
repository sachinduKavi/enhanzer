import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

function runGuard(guard: CanActivateFn, isAuthenticated: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { isAuthenticated: () => isAuthenticated } },
    ],
  });

  return TestBed.runInInjectionContext(() => guard(null!, null!));
}

function redirectPath(result: unknown): string {
  return TestBed.inject(Router).serializeUrl(result as UrlTree);
}

describe('authGuard', () => {
  it('allows authenticated users', () => {
    expect(runGuard(authGuard, true)).toBe(true);
  });

  it('redirects anonymous users to the login page', () => {
    expect(redirectPath(runGuard(authGuard, false))).toBe('/login');
  });
});

describe('guestGuard', () => {
  it('allows anonymous users to see the login page', () => {
    expect(runGuard(guestGuard, false)).toBe(true);
  });

  it('sends logged-in users straight to the purchase bill page', () => {
    expect(redirectPath(runGuard(guestGuard, true))).toBe('/purchase-bill');
  });
});
