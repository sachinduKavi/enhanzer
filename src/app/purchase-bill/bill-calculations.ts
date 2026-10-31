type Amount = number | null;

const round = (value: number) => Math.round(value * 100) / 100;

export function calculateMargin(standardCost: Amount, standardPrice: Amount): number | null {
  return standardCost === null || standardPrice === null
    ? null
    : round(standardPrice - standardCost);
}

// (Standard Cost × Qty) less Discount %, e.g. 100 × 5 less 20% = 400.
export function calculateTotalCost(
  standardCost: Amount,
  qty: Amount,
  discount: Amount,
): number | null {
  if (standardCost === null || qty === null) {
    return null;
  }

  return round(standardCost * qty * (1 - (discount ?? 0) / 100));
}

export function calculateTotalSelling(standardPrice: Amount, qty: Amount): number | null {
  return standardPrice === null || qty === null ? null : round(standardPrice * qty);
}
