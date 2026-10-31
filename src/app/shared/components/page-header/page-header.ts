import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-page-header',
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <header
      class="flex items-center gap-3 bg-linear-to-r from-[#45a8f0] via-[#2f6fd0] to-[#1a237e] px-4 py-3 text-white sm:px-5"
    >
      <app-icon class="size-8 sm:size-9" name="info" />
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-lg leading-tight font-semibold sm:text-xl">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="truncate text-xs text-white/90">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex shrink-0 items-center gap-1 sm:gap-3">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
