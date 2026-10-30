import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InvalidCredentialsError } from '../core/auth/auth.models';
import { AuthService } from '../core/auth/auth.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly isLoading = signal(false);
  protected readonly isPasswordVisible = signal(false);
  protected readonly errorMessage = signal('');

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((isVisible) => !isVisible);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login(email.trim(), password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/purchase-bill']),
        error: (error: unknown) =>
          this.errorMessage.set(
            error instanceof InvalidCredentialsError
              ? error.message
              : 'Unable to sign in right now. Please check your connection and try again.',
          ),
      });
  }
}
