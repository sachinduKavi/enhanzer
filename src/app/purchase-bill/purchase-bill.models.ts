import { StoredLocation } from '../core/location/location.service';

export const BILL_ITEM_NAMES = [
  'Mango',
  'Apple',
  'Banana',
  'Orange',
  'Grapes',
  'Kiwi',
  'Strawberry',
] as const;

export interface BillItem {
  item: string;
  batch: StoredLocation;
  standardCost: number;
  standardPrice: number;
  margin: number;
  qty: number;
  freeQty: number;
  discount: number;
  totalCost: number;
  totalSelling: number;
}
