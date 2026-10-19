// money.ts
export function formatMoney(value: number, currency = 'EGP'): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(value);
}
export const VAT_RATE = 0.14;

// order-summary.ts
import { formatMoney, VAT_RATE } from './money';          // relative path
import { Component, signal } from '@angular/core';         // package

export function withVat(amount: number): string {
  return formatMoney(amount * (1 + VAT_RATE));
}
