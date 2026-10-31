import { LowerCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Icon } from '../shared/components/icon/icon';
import { PageHeader } from '../shared/components/page-header/page-header';
import { Tabs } from '../shared/components/tabs/tabs';
import { BillSummary } from './components/bill-summary/bill-summary';
import { ItemEntryForm } from './components/item-entry-form/item-entry-form';
import { ItemsTable } from './components/items-table/items-table';
import { PurchaseBillStore } from './purchase-bill.store';

@Component({
  selector: 'app-purchase-bill',
  imports: [BillSummary, Icon, ItemEntryForm, ItemsTable, LowerCasePipe, PageHeader, Tabs],
  providers: [PurchaseBillStore],
  templateUrl: './purchase-bill.html',
})
export class PurchaseBill {
  protected readonly store = inject(PurchaseBillStore);

  protected readonly pageTabs = ['Header', 'Details', 'Notes', 'Documents'] as const;
  protected readonly detailTabs = ['Items', 'Accounts', 'Taxes'] as const;

  protected readonly activePageTab = signal<string>('Details');
  protected readonly activeDetailTab = signal<string>('Items');
}
