import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-tabs',
  host: { class: 'block' },
  template: `
    <div class="flex overflow-x-auto border-b border-gray-200" role="tablist">
      @for (tab of tabs(); track tab) {
        <button
          class="shrink-0 cursor-pointer border-b-2 px-4 py-2 text-sm whitespace-nowrap transition-colors"
          type="button"
          role="tab"
          [class]="
            tab === active()
              ? 'border-blue-700 font-medium text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          "
          [attr.aria-selected]="tab === active()"
          (click)="active.set(tab)"
        >
          {{ tab }}
        </button>
      }
    </div>
  `,
})
export class Tabs {
  readonly tabs = input.required<readonly string[]>();
  readonly active = model.required<string>();
}
