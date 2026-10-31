import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { LocationService, StoredLocation } from '../../../core/location/location.service';
import { Autocomplete } from '../../../shared/components/autocomplete/autocomplete';
import { FormField } from '../../../shared/components/form-field/form-field';
import { Icon } from '../../../shared/components/icon/icon';
import { fieldError, greaterThan, oneOf } from '../../../shared/forms/validators';
import {
  calculateMargin,
  calculateTotalCost,
  calculateTotalSelling,
} from '../../bill-calculations';
import { BILL_ITEM_NAMES, BillItem } from '../../purchase-bill.models';

@Component({
  selector: 'app-item-entry-form',
  imports: [Autocomplete, DecimalPipe, FormField, Icon, ReactiveFormsModule],
  templateUrl: './item-entry-form.html',
})
export class ItemEntryForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly locationService = inject(LocationService);

  readonly itemAdded = output<BillItem>();

  protected readonly itemNames = BILL_ITEM_NAMES;
  protected readonly fieldError = fieldError;
  protected readonly batches = signal<StoredLocation[]>([]);
  protected readonly batchStatus = signal<'loading' | 'loaded' | 'error'>('loading');

  protected readonly form = this.fb.group({
    item: ['', [Validators.required, oneOf(BILL_ITEM_NAMES)]],
    batch: this.fb.control<StoredLocation | null>(null, Validators.required),
    standardCost: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    standardPrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    qty: this.fb.control<number | null>(null, [Validators.required, greaterThan(0)]),
    freeQty: this.fb.control<number | null>(null, Validators.min(0)),
    discount: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]),
  });

  private readonly values = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly margin = computed(() =>
    calculateMargin(this.values().standardCost, this.values().standardPrice),
  );
  protected readonly totalCost = computed(() =>
    calculateTotalCost(this.values().standardCost, this.values().qty, this.values().discount),
  );
  protected readonly totalSelling = computed(() =>
    calculateTotalSelling(this.values().standardPrice, this.values().qty),
  );

  constructor() {
    this.loadBatches();
  }

  protected loadBatches(): void {
    this.batchStatus.set('loading');
    this.locationService.getLocations().subscribe({
      next: (batches) => {
        this.batches.set(batches);
        this.batchStatus.set('loaded');
      },
      error: () => this.batchStatus.set('error'),
    });
  }

  protected add(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.itemAdded.emit({
      item: value.item,
      batch: value.batch!,
      standardCost: value.standardCost!,
      standardPrice: value.standardPrice!,
      margin: this.margin()!,
      qty: value.qty!,
      freeQty: value.freeQty ?? 0,
      discount: value.discount ?? 0,
      totalCost: this.totalCost()!,
      totalSelling: this.totalSelling()!,
    });
    this.reset();
  }

  reset(): void {
    this.form.reset();
  }
}
