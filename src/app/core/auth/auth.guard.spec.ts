import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  function runGuard(isAuthenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => isAuthenticated } },
      ],
    });

    return TestBed.runInInjectionContext(() => authGuard(null!, null!));
  }

  it('allows authenticated users', () => {
    expect(runGuard(true)).toBe(true);
  });

  it('redirects anonymous users to the login page', () => {
    const result = runGuard(false) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });
});
