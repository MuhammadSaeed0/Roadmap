const prices = { 1: 49.99, 2: 15.99, 3: 23.99 };
const getPrice = id => new Promise(resolve => setTimeout(() => resolve(prices[id]), 100));

async function cartTotal(ids) {
  const all = await Promise.all(ids.map(getPrice));
  return Math.round(all.reduce((sum, p) => sum + p, 0) * 100) / 100;
}
