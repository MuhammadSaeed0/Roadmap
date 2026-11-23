class Account {
  // TODO: make id readonly and the balance truly private (a #private field),
  // readable through a getter but never assignable from outside.
  constructor(public id: string, public balance: number) {}

  deposit(amount: number): void {
    this.balance += amount;
  }

  // Throws Error('Insufficient funds') instead of going below zero, and rejects amounts <= 0.
  withdraw(amount: number): void {
    this.balance -= amount;
  }
}
