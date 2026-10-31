import { calculateMargin, calculateTotalCost, calculateTotalSelling } from './bill-calculations';

describe('bill calculations', () => {
  it('matches the assignment example: cost 100, price 150, qty 5, discount 20%', () => {
    expect(calculateMargin(100, 150)).toBe(50);
    expect(calculateTotalCost(100, 5, 20)).toBe(400);
    expect(calculateTotalSelling(150, 5)).toBe(750);
  });

  it('treats an empty discount as no discount', () => {
    expect(calculateTotalCost(100, 5, null)).toBe(500);
  });

  it('rounds to two decimals', () => {
    expect(calculateTotalCost(0.1, 3, 0)).toBe(0.3);
    expect(calculateTotalCost(9.99, 3, 15)).toBe(25.47);
  });

  it('returns null until the needed fields are filled', () => {
    expect(calculateMargin(null, 150)).toBeNull();
    expect(calculateTotalCost(100, null, 20)).toBeNull();
    expect(calculateTotalSelling(150, null)).toBeNull();
  });
});
