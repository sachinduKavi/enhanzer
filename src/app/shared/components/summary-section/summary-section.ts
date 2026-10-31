import { Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-summary-section',
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
      <app-icon class="size-4" [name]="icon()" />
      {{ title() }}
      @if (hint()) {
        <app-icon class="size-4 text-gray-500" name="info" [attr.title]="hint()" />
      }
    </h3>
    <dl class="space-y-2 pl-6">
      <ng-content />
    </dl>
  `,
})
export class SummarySection {
  readonly title = input.required<string>();
  readonly icon = input.required<IconName>();
  readonly hint = input('');
}
