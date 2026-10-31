import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../shared/components/icon/icon';
import { BillItem } from '../../purchase-bill.models';

@Component({
  selector: 'app-items-table',
  imports: [DecimalPipe, Icon],
  host: { class: 'block overflow-x-auto' },
  templateUrl: './items-table.html',
})
export class ItemsTable {
  readonly items = input.required<BillItem[]>();
  readonly remove = output<number>();
}
