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
    <!-- Always rendered so an error appearing never shifts the layout under the cursor. -->
    <p class="mt-1 min-h-4 text-xs leading-4 text-red-600" aria-live="polite">{{ error() }}</p>
  `,
})
export class FormField {
  readonly label = input.required<string>();
  readonly for = input<string>();
  readonly required = input(false);
  readonly error = input<string | null>(null);
}
