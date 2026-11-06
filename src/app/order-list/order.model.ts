export interface PurchaseOrder {
  id: number;
  createdAt: string;
  totalItems: number;
  totalQty: number;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: number;
  itemName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}
