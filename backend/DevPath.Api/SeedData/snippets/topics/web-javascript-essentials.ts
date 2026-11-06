// Plain JavaScript (valid TypeScript too): a debounced search box.
const input = document.querySelector('#q');
const list = document.querySelector('#results');
let timer;
let controller;

input.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => search(input.value.trim()), 300);
});

async function search(term) {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch(`/api/products?search=${encodeURIComponent(term)}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();
    list.replaceChildren(...products.map(p => {
      const li = document.createElement('li');
      li.textContent = `${p.name} — ${p.price}`;
      return li;
    }));
  } catch (err) {
    if (err.name !== 'AbortError') list.textContent = 'Search failed, please try again.';
  }
}
