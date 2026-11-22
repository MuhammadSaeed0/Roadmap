console.log(1);
setTimeout(() => console.log(2), 0);          // macrotask
Promise.resolve().then(() => console.log(3)); // microtask
console.log(4);
// Output: 1, 4, 3, 2
