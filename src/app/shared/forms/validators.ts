import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function oneOf(options: readonly string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    !control.value || options.includes(control.value) ? null : { oneOf: true };
}

export function greaterThan(limit: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    control.value === null || control.value === '' || control.value > limit
      ? null
      : { greaterThan: { limit } };
}

export function fieldError(control: AbstractControl): string | null {
  if (!control.touched || !control.errors) {
    return null;
  }

  const errors = control.errors;
  if (errors['required']) return 'Required';
  if (errors['oneOf']) return 'Pick from the list';
  if (errors['greaterThan']) return `Must be > ${errors['greaterThan'].limit}`;
  if (errors['min']) return `Must be ≥ ${errors['min'].min}`;
  if (errors['max']) return `Must be ≤ ${errors['max'].max}`;
  return 'Invalid value';
}
