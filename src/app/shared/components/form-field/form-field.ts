import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  host: { class: 'block' },
  template: `
    <label class="mb-1 block text-xs font-medium text-gray-700" [attr.for]="for()">
      {{ label() }}
      @if (required()) {
        <span class="text-red-600" aria-hidden="true">*</span>
      }
    </label>
    <ng-content />
    @if (error()) {
      <p class="mt-1 text-xs text-red-600">{{ error() }}</p>
    }
  `,
})
export class FormField {
  readonly label = input.required<string>();
  readonly for = input<string>();
  readonly required = input(false);
  readonly error = input<string | null>(null);
}
