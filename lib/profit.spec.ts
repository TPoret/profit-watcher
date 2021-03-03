import { totalProfit, Transaction } from "./profit";

describe("profit", () => {
  it("get a correct total", () => {
    const transactions: Transaction[] = [
      { value: 1, date: new Date(), unit: "€" },
      { value: -3, date: new Date(), unit: "€" },
      { value: 1, date: new Date(), unit: "€" },
      { value: 1, date: new Date(), unit: "€" },
    ];

    expect(totalProfit(transactions)).toBe(0);
  });
});
