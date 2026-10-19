const price = signal(100);
const quantity = signal(2);
const total = computed(() => price() * quantity());   // derived, read-only

effect(() => console.log(`Total is now ${total()}`)); // side effect

quantity.set(3);   // total() becomes 300 and the effect logs it
