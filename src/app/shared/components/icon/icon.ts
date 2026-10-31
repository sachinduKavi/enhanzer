import { Component, input } from '@angular/core';

export type IconName =
  | 'info'
  | 'refresh'
  | 'plus-circle'
  | 'check-circle'
  | 'x-circle'
  | 'chart'
  | 'box'
  | 'dollar'
  | 'tag'
  | 'receipt'
  | 'list'
  | 'plus';

@Component({
  selector: 'app-icon',
  host: { class: 'inline-block shrink-0' },
  template: `
    <svg
      class="size-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('info') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        }
        @case ('refresh') {
          <path d="M20 12a8 8 0 1 1-2.34-5.66" />
          <path d="M20 4v4h-4" />
        }
        @case ('plus-circle') {
          <circle cx="12" cy="12" r="9" stroke-dasharray="3 2" />
          <path d="M12 8v8M8 12h8" />
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        }
        @case ('x-circle') {
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6M15 9l-6 6" />
        }
        @case ('chart') {
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M9 17v-3M12 17v-6M15 17v-4" />
        }
        @case ('box') {
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        }
        @case ('dollar') {
          <path
            d="M12 3v18M16 7.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5S9.8 10 12 10s4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5"
          />
        }
        @case ('tag') {
          <path d="M3 12V4h8l10 10-8 8z" />
          <circle cx="7.5" cy="8.5" r="1.25" />
        }
        @case ('receipt') {
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
        }
        @case ('list') {
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 9h10M7 12h10M7 15h6" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}
