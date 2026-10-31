import { Component, input } from '@angular/core';

@Component({
  selector: 'app-summary-row',
  host: { class: 'flex items-baseline justify-between gap-3 text-xs' },
  template: `
    <dt class="text-gray-700">{{ label() }}</dt>
    <dd class="font-medium text-gray-800 tabular-nums">{{ value() }}</dd>
  `,
})
export class SummaryRow {
  readonly label = input.required<string>();
  readonly value = input.required<string | null>();
}
