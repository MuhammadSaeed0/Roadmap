class Counter {
  value = 0;
  increment() {
    this.value++;
  }
}

const counter = new Counter();
[1, 2, 3].forEach(counter.increment);
console.log(counter.value);
