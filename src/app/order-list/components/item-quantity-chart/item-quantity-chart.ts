import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { BILL_ITEM_NAMES } from '../../../purchase-bill/purchase-bill.models';
import { PurchaseOrder } from '../../order.model';

// Fixed colour per item (validated categorical palette), so an item keeps its colour
// no matter how the totals are ranked.
const ITEM_COLORS: Record<string, string> = Object.fromEntries(
  BILL_ITEM_NAMES.map((name, i) => [
    name,
    ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6'][i],
  ]),
);
const OTHER_COLOR = '#9ca3af';

export interface ItemQuantity {
  name: string;
  qty: number;
  share: number;
  color: string;
}

@Component({
  selector: 'app-item-quantity-chart',
  imports: [BaseChartDirective, DecimalPipe, PercentPipe],
  host: { class: 'block' },
  templateUrl: './item-quantity-chart.html',
})
export class ItemQuantityChart {
  readonly orders = input.required<PurchaseOrder[]>();

  protected readonly items = computed<ItemQuantity[]>(() => {
    const totals = new Map<string, number>();
    for (const order of this.orders()) {
      for (const item of order.items) {
        totals.set(item.itemName, (totals.get(item.itemName) ?? 0) + item.quantity);
      }
    }

    const grandTotal = [...totals.values()].reduce((sum, qty) => sum + qty, 0);
    return [...totals.entries()]
      .map(([name, qty]) => ({
        name,
        qty,
        share: grandTotal ? qty / grandTotal : 0,
        color: ITEM_COLORS[name] ?? OTHER_COLOR,
      }))
      .sort((a, b) => b.qty - a.qty);
  });

  protected readonly totalQty = computed(() =>
    this.items().reduce((sum, item) => sum + item.qty, 0),
  );

  protected readonly chartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.items().map((item) => item.name),
    datasets: [
      {
        data: this.items().map((item) => item.qty),
        backgroundColor: this.items().map((item) => item.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }));

  protected readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = this.items()[context.dataIndex];
            return ` ${item.qty.toLocaleString()} qty (${Math.round(item.share * 100)}%)`;
          },
        },
      },
    },
  };
}
