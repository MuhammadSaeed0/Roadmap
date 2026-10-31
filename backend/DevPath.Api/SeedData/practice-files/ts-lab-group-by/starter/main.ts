function groupBy<T, K extends string | number>(items: T[], key: (item: T) => K): Record<K, T[]> {
  throw new Error("TODO");
}

const products = [
  { name: "Headset", category: "Audio" },
  { name: "Mouse", category: "Input" },
  { name: "Speakers", category: "Audio" },
];
console.log(groupBy(products, p => p.category));
