function groupBy<T, K extends string | number>(items: T[], key: (item: T) => K): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) (groups[key(item)] ??= []).push(item);
  return groups;
}

const products = [
  { name: "Headset", category: "Audio" },
  { name: "Mouse", category: "Input" },
  { name: "Speakers", category: "Audio" },
];
console.log(groupBy(products, p => p.category));
