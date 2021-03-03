export interface Sum {
  readonly value: number;
  readonly currency: string;
}

export interface Transaction extends Sum {
  readonly date: Date;
}

export interface ExchangeRate {
  readonly nominator: string;
  readonly denominator: string;
  readonly rate: number;
}

export const totalProfit = (transactions: Transaction[]): number => {
  return transactions.map((t) => t.value).reduce((acc, curr) => acc + curr, 0);
};
