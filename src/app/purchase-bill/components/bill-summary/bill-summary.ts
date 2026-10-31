import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Icon } from '../../../shared/components/icon/icon';
import { SummaryRow } from '../../../shared/components/summary-row/summary-row';
import { SummarySection } from '../../../shared/components/summary-section/summary-section';

@Component({
  selector: 'app-bill-summary',
  imports: [DecimalPipe, Icon, SummaryRow, SummarySection],
  host: { class: 'block' },
  template: `
    <aside class="space-y-5 rounded-md border border-gray-200 bg-gray-50 p-4">
      <h2 class="flex items-center gap-2 font-semibold text-blue-700">
        <app-icon class="size-5" name="chart" />
        Summary
      </h2>

      <app-summary-section title="Item Summary" icon="box" hint="Rows added to the bill">
        <app-summary-row label="Total Items" [value]="totalItems() | number" />
        <app-summary-row label="Total Qty" [value]="totalQty() | number: '1.0-2'" />
      </app-summary-section>

      <app-summary-section title="Financial Summary" icon="dollar">
        <app-summary-row label="Gross Total" [value]="0 | number: '1.2-2'" />
        <app-summary-row label="Item Discount" [value]="0 | number: '1.2-2'" />
        <app-summary-row label="Overall Discount" [value]="0 | number: '1.2-2'" />
        <app-summary-row label="Total Discounts" [value]="0 | number: '1.2-2'" />
        <app-summary-row label="Total Before Tax" [value]="0 | number: '1.2-2'" />
      </app-summary-section>

      <app-summary-section title="Tax Summary" icon="tag" hint="Tax is not applied to this bill">
        <app-summary-row label="Total Tax" [value]="0 | number: '1.2-2'" />
        <app-summary-row label="Suspended Tax" [value]="0 | number: '1.2-2'" />
      </app-summary-section>

      <div>
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <app-icon class="size-4" name="receipt" />
          Net Total
        </h3>
        <p class="mt-1 text-right text-lg font-bold text-gray-800 tabular-nums">
          Rs. {{ 0 | number: '1.2-2' }}
        </p>
      </div>
    </aside>
  `,
})
export class BillSummary {
  readonly totalItems = input.required<number>();
  readonly totalQty = input.required<number>();
}
