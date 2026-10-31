const prices = { 1: 49.99, 2: 15.99, 3: 23.99 };
const getPrice = id => new Promise(resolve => setTimeout(() => resolve(prices[id]), 100));

async function cartTotal(ids) {
  let total = 0;
  ids.forEach(async id => {
    total += await getPrice(id);
  });
  return Math.round(total * 100) / 100;
}
