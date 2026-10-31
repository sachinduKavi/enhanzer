import { Component, signal } from '@angular/core';
import { Icon } from '../shared/components/icon/icon';
import { PageHeader } from '../shared/components/page-header/page-header';
import { Tabs } from '../shared/components/tabs/tabs';
import { BillSummary } from './components/bill-summary/bill-summary';

@Component({
  selector: 'app-purchase-bill',
  imports: [BillSummary, Icon, PageHeader, Tabs],
  templateUrl: './purchase-bill.html',
})
export class PurchaseBill {
  protected readonly pageTabs = ['Header', 'Details', 'Notes', 'Documents'] as const;
  protected readonly detailTabs = ['Items', 'Accounts', 'Taxes'] as const;

  protected readonly activePageTab = signal<string>('Details');
  protected readonly activeDetailTab = signal<string>('Items');
}
