export const CATEGORIES = ['Food', 'Transport', 'Bills', 'Fun', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: Category;
  date: string; // yyyy-mm-dd
}
