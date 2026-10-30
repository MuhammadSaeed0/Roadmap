function formatPrice(amount: number, currency: string = "EGP"): string {
  const digits = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${amount < 0 ? "-" : ""}${currency} ${digits}`;
}

console.log(formatPrice(1234.5));
