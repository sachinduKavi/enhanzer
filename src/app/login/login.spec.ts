import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthSession, InvalidCredentialsError } from '../core/auth/auth.models';
import { AuthService } from '../core/auth/auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let element: HTMLElement;
  const login = vi.fn<(email: string, password: string) => Observable<AuthSession>>();

  beforeEach(async () => {
    login.mockReset();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  function setValue(id: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('shows required messages and does not call the API for an empty form', async () => {
    await submit();

    expect(element.textContent).toContain('Email is required.');
    expect(element.textContent).toContain('Password is required.');
    expect(login).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    setValue('email', 'not-an-email');
    setValue('password', 'secret');
    await submit();

    expect(element.textContent).toContain('Enter a valid email address.');
    expect(login).not.toHaveBeenCalled();
  });

  it('navigates to the purchase bill page after a successful login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    login.mockReturnValue(of({ email: 'user@example.com', displayName: 'Test User' }));

    setValue('email', ' user@example.com ');
    setValue('password', 'secret');
    await submit();

    expect(login).toHaveBeenCalledWith('user@example.com', 'secret');
    expect(navigate).toHaveBeenCalledWith(['/purchase-bill']);
  });

  it('shows the credentials message when login is rejected', async () => {
    login.mockReturnValue(throwError(() => new InvalidCredentialsError()));

    setValue('email', 'user@example.com');
    setValue('password', 'wrong');
    await submit();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Invalid email or password.',
    );
  });

  it('shows a connection message when the request fails', async () => {
    login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    setValue('email', 'user@example.com');
    setValue('password', 'secret');
    await submit();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to sign in right now.',
    );
  });

  it('toggles password visibility', async () => {
    const password = element.querySelector<HTMLInputElement>('#password')!;
    expect(password.type).toBe('password');

    element.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    await fixture.whenStable();

    expect(password.type).toBe('text');
  });
});
